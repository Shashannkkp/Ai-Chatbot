
import dns from "node:dns/promises";
import ipaddr from "ipaddr.js";
import mongoose from "mongoose";
import { load } from "cheerio";

import { connectToDatabase } from "../lib/mongodb.js";
import { authenticateRequest } from "../lib/auth.js";
import { generateEmbedding } from "../lib/embeddings.js";
import KnowledgeChunk from "../models/KnowledgeChunk.js";

const MAX_TEXT_LENGTH = 30000;
const MAX_HTML_SIZE = 2 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT = 15000;

function splitIntoChunks(text, chunkSize = 1200, overlap = 150) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);

    if (end < text.length) {
      const boundary = text.lastIndexOf(" ", end);

      if (boundary > start + chunkSize * 0.6) {
        end = boundary;
      }
    }

    const chunk = text.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= text.length) break;

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

function isPublicIP(address) {
  try {
    const parsed = ipaddr.parse(address);
    return parsed.range() === "unicast";
  } catch {
    return false;
  }
}

async function validateUrl(value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error("Please provide a valid website URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported");
  }

  if (url.username || url.password) {
    throw new Error("URLs containing credentials are not allowed");
  }

  if (url.port && !["80", "443"].includes(url.port)) {
    throw new Error("This website port is not allowed");
  }

  const hostname = url.hostname
    .replace(/^\[|\]$/g, "")
    .toLowerCase();

  if (
    !hostname ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("Private or local website addresses are not allowed");
  }

  // Reject private, reserved, and non-public IP addresses.
  if (ipaddr.isValid(hostname)) {
    if (!isPublicIP(hostname)) {
      throw new Error("Private or reserved IP addresses are not allowed");
    }
  } else {
    let addresses;

    try {
      addresses = await dns.lookup(hostname, {
        all: true,
        verbatim: true,
      });
    } catch {
      throw new Error("Could not resolve the website address");
    }

    if (
      !addresses.length ||
      addresses.some(({ address }) => !isPublicIP(address))
    ) {
      throw new Error("Website resolves to a private or unsafe IP address");
    }
  }

  url.hash = "";

  return url;
}

async function fetchWebsite(initialUrl) {
  let currentUrl = initialUrl;

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
    // Validate every destination, including redirects.
    currentUrl = await validateUrl(currentUrl.href);

    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      headers: {
        "User-Agent": "NovaAI-KnowledgeBot/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");

      await response.body?.cancel();

      if (!location) {
        throw new Error("Website returned an invalid redirect");
      }

      if (redirect === MAX_REDIRECTS) {
        throw new Error("Too many website redirects");
      }

      currentUrl = new URL(location, currentUrl);
      continue;
    }

    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`Website returned HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml")
    ) {
      await response.body?.cancel();
      throw new Error("The URL must point to an HTML webpage");
    }

    const contentLength = Number(
      response.headers.get("content-length") || 0
    );

    if (contentLength > MAX_HTML_SIZE) {
      await response.body?.cancel();
      throw new Error("Website HTML exceeds the 2 MB limit");
    }

    if (!response.body) {
      throw new Error("Website returned an empty response");
    }

    const reader = response.body.getReader();
    const parts = [];
    let totalSize = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        totalSize += value.length;

        if (totalSize > MAX_HTML_SIZE) {
          await reader.cancel();
          throw new Error("Website HTML exceeds the 2 MB limit");
        }

        parts.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const html = new TextDecoder("utf-8", {
      fatal: false,
    }).decode(
      Buffer.concat(parts.map((part) => Buffer.from(part)))
    );

    return {
      html,
      finalUrl: currentUrl.href,
    };
  }

  throw new Error("Unable to retrieve website");
}

function extractWebsiteContent(html) {
  const $ = load(html);

  const title = $("title").first().text().trim();

  $(
    "script, style, noscript, svg, iframe, canvas, nav, footer, header, aside, form"
  ).remove();

  const content = $("body")
    .text()
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: title.slice(0, 200),
    content: content.slice(0, MAX_TEXT_LENGTH),
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // Authenticate the user.
    const decoded = authenticateRequest(req);

    if (!decoded?.userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({
        error: "Invalid user identity",
      });
    }

    const { url: submittedUrl } = req.body || {};

    if (
      typeof submittedUrl !== "string" ||
      !submittedUrl.trim() ||
      submittedUrl.length > 2048
    ) {
      return res.status(400).json({
        error: "Please provide a valid website URL",
      });
    }

    // Validate and normalize the submitted URL.
    const websiteUrl = await validateUrl(submittedUrl.trim());

    await connectToDatabase();

    const userId = new mongoose.Types.ObjectId(decoded.userId);

    // Prevent duplicate ingestion for the same user.
    const existingWebsite = await KnowledgeChunk.findOne({
      userId,
      sourceType: "website",
      sourceUrl: websiteUrl.href,
    }).lean();

    if (existingWebsite) {
      return res.status(409).json({
        error: "This website has already been added to your knowledge base",
      });
    }

    // Fetch and extract website content.
    const { html, finalUrl } = await fetchWebsite(websiteUrl);

    const { title, content } = extractWebsiteContent(html);

    if (!content || content.length < 50) {
      return res.status(400).json({
        error: "Not enough readable text was found on this webpage",
      });
    }

    if (content.length >= MAX_TEXT_LENGTH) {
      console.log("Website content reached the extraction limit:", finalUrl);
    }

    const chunks = splitIntoChunks(content);

    if (!chunks.length) {
      return res.status(400).json({
        error: "Could not create chunks from this website",
      });
    }

    const sourceName =
      title || new URL(finalUrl).hostname;

    // Generate embeddings before saving.
    const documentsToSave = [];

    for (let index = 0; index < chunks.length; index++) {
      const embedding = await generateEmbedding(chunks[index]);

      documentsToSave.push({
        userId,
        sourceType: "website",
        sourceName: sourceName.slice(0, 200),
        sourceUrl: websiteUrl.href,
        content: chunks[index],
        embedding,
        chunkIndex: index,
      });
    }

    const savedChunks = await KnowledgeChunk.insertMany(
      documentsToSave
    );

    return res.status(201).json({
      success: true,
      message: "Website processed and saved successfully",
      website: {
        name: sourceName,
        url: websiteUrl.href,
        finalUrl,
        chunksCreated: savedChunks.length,
        charactersExtracted: content.length,
      },
    });
  } catch (error) {
    console.error("Website ingestion error:", error);

    const clientErrors = [
      "Please provide a valid website URL",
      "Only HTTP and HTTPS URLs are supported",
      "URLs containing credentials are not allowed",
      "This website port is not allowed",
      "Private or local website addresses are not allowed",
      "Private or reserved IP addresses are not allowed",
      "Could not resolve the website address",
      "Website resolves to a private or unsafe IP address",
      "Too many website redirects",
      "Website returned an invalid redirect",
      "The URL must point to an HTML webpage",
      "Website HTML exceeds the 2 MB limit",
      "Not enough readable text was found on this webpage",
      "Could not create chunks from this website",
    ];

    if (clientErrors.includes(error.message)) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: error.message?.startsWith("Website returned HTTP ")
        ? error.message
        : "Failed to process website",
    });
  }
}
