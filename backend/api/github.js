
import mongoose from "mongoose";

import { connectToDatabase } from "../lib/mongodb.js";
import { authenticateRequest } from "../lib/auth.js";
import { generateEmbedding } from "../lib/embeddings.js";
import KnowledgeChunk from "../models/KnowledgeChunk.js";

const MAX_TEXT_LENGTH = 30000;
const MAX_FILE_SIZE = 100 * 1024;
const MAX_REPOSITORY_FILES = 25;
const REQUEST_TIMEOUT = 15000;

const GITHUB_API = "https://api.github.com";

const ALLOWED_EXTENSIONS = new Set([
  ".md",
  ".mdx",
  ".txt",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".html",
  ".htm",
  ".css",
  ".scss",
  ".sass",
  ".py",
  ".java",
  ".go",
  ".rs",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".php",
  ".rb",
  ".sh",
  ".bash",
  ".yml",
  ".yaml",
  ".toml",
  ".xml",
  ".sql",
  ".vue",
  ".svelte",
  ".graphql",
  ".gql",
]);

const ALLOWED_FILENAMES = new Set([
  "readme",
  "dockerfile",
  "makefile",
  "procfile",
  ".gitignore",
  ".dockerignore",
  ".npmrc",
  ".nvmrc",
]);

const EXCLUDED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "vendor",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  ".output",
  "out",
  "target",
  "__pycache__",
  ".venv",
  "venv",
  "bower_components",
]);

const EXCLUDED_FILENAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lock",
  "bun.lockb",
  "composer.lock",
  "poetry.lock",
  "cargo.lock",
]);

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateRepositoryUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError("Please provide a GitHub repository URL");
  }

  let url;

  try {
    url = new URL(value.trim());
  } catch {
    throw createHttpError("Invalid GitHub repository URL");
  }

  if (
    url.protocol !== "https:" ||
    url.hostname.toLowerCase() !== "github.com" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    url.search ||
    url.hash
  ) {
    throw createHttpError(
      "Only public GitHub repository URLs are supported"
    );
  }

  const parts = url.pathname
    .split("/")
    .filter(Boolean);

  if (parts.length !== 2) {
    throw createHttpError(
      "Use this URL format: https://github.com/owner/repository"
    );
  }

  const owner = parts[0];
  let repo = parts[1];

  if (repo.toLowerCase().endsWith(".git")) {
    repo = repo.slice(0, -4);
  }

  const validOwner = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/;
  const validRepo = /^[a-zA-Z0-9._-]+$/;

  if (
    !validOwner.test(owner) ||
    !validRepo.test(repo) ||
    repo === "." ||
    repo === ".."
  ) {
    throw createHttpError("Invalid GitHub owner or repository name");
  }

  return {
    owner,
    repo,
    sourceName: `${owner}/${repo}`,
    sourceUrl: `https://github.com/${owner.toLowerCase()}/${repo.toLowerCase()}`,
  };
}

async function fetchGitHubApi(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Nova-AI-RAG",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw createHttpError(
        "Repository not found or it is not publicly accessible",
        404
      );
    }

    if (
      response.status === 403 &&
      response.headers.get("x-ratelimit-remaining") === "0"
    ) {
      throw createHttpError(
        "GitHub API rate limit reached. Please try again later",
        429
      );
    }

    throw createHttpError(
      `GitHub API request failed with status ${response.status}`,
      502
    );
  }

  return response.json();
}

function getFileExtension(filePath) {
  const filename = filePath.split("/").pop().toLowerCase();

  if (ALLOWED_FILENAMES.has(filename)) {
    return filename;
  }

  const dotIndex = filename.lastIndexOf(".");

  if (dotIndex === -1) {
    return "";
  }

  return filename.slice(dotIndex);
}

function shouldIncludeFile(file) {
  if (file.type !== "blob") {
    return false;
  }

  if (
    typeof file.size !== "number" ||
    file.size < 1 ||
    file.size > MAX_FILE_SIZE
  ) {
    return false;
  }

  const pathParts = file.path.split("/");
  const filename = pathParts[pathParts.length - 1].toLowerCase();

  if (
    pathParts.some((part) =>
      EXCLUDED_DIRECTORIES.has(part.toLowerCase())
    )
  ) {
    return false;
  }

  if (EXCLUDED_FILENAMES.has(filename)) {
    return false;
  }

  if (
    filename.startsWith(".env") ||
    filename.endsWith(".min.js") ||
    filename.endsWith(".min.css") ||
    filename.endsWith(".map")
  ) {
    return false;
  }

  const extension = getFileExtension(file.path);

  return (
    ALLOWED_EXTENSIONS.has(extension) ||
    ALLOWED_FILENAMES.has(extension)
  );
}

function prioritizeFiles(files) {
  return [...files].sort((a, b) => {
    const aName = a.path.split("/").pop().toLowerCase();
    const bName = b.path.split("/").pop().toLowerCase();

    const aPriority = aName.startsWith("readme") ? 0 : 1;
    const bPriority = bName.startsWith("readme") ? 0 : 1;

    return aPriority - bPriority || a.path.localeCompare(b.path);
  });
}

async function fetchRepositoryFile(owner, repo, commitSha, filePath) {
  const encodedPath = filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const url =
    `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/` +
    `${encodeURIComponent(repo)}/${commitSha}/${encodedPath}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "Nova-AI-RAG",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw createHttpError(
        "GitHub temporarily limited repository file requests",
        429
      );
    }

    return null;
  }

  const content = await response.text();

  if (
    !content.trim() ||
    content.includes("\u0000") ||
    content.length > MAX_FILE_SIZE
  ) {
    return null;
  }

  return content;
}

async function extractRepositoryText(owner, repo) {
  // Get repository information and its default branch.
  const repository = await fetchGitHubApi(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  );

  if (repository.private) {
    throw createHttpError(
      "Only public GitHub repositories are supported"
    );
  }

  const defaultBranch = repository.default_branch;

  if (!defaultBranch) {
    throw createHttpError("Could not identify the repository's default branch");
  }

  // Resolve the default branch to a commit SHA.
  const branch = await fetchGitHubApi(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches/${encodeURIComponent(defaultBranch)}`
  );

  const commitSha = branch.commit?.sha;

  if (!commitSha) {
    throw createHttpError("Could not identify the repository commit");
  }

  // Fetch the repository file tree.
  const tree = await fetchGitHubApi(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${commitSha}?recursive=1`
  );

  if (tree.truncated) {
    throw createHttpError(
      "This repository is too large to process in one request"
    );
  }

  const eligibleFiles = prioritizeFiles(
    (tree.tree || []).filter(shouldIncludeFile)
  ).slice(0, MAX_REPOSITORY_FILES);

  if (eligibleFiles.length === 0) {
    throw createHttpError(
      "No supported text or source-code files were found in this repository"
    );
  }

  const sections = [];
  let totalCharacters = 0;
  let filesProcessed = 0;

  // Fetch files one at a time to keep resource usage controlled.
  for (const file of eligibleFiles) {
    if (totalCharacters >= MAX_TEXT_LENGTH) {
      break;
    }

    const content = await fetchRepositoryFile(
      owner,
      repo,
      commitSha,
      file.path
    );

    if (!content) {
      continue;
    }

    const heading = `\n\n--- FILE: ${file.path} ---\n`;
    const remaining = MAX_TEXT_LENGTH - totalCharacters;
    const availableContent = remaining - heading.length;

    if (availableContent <= 0) {
      break;
    }

    const trimmedContent = content
      .replace(/\r\n/g, "\n")
      .trim()
      .slice(0, availableContent);

    if (!trimmedContent) {
      continue;
    }

    const section = heading + trimmedContent;

    sections.push(section);
    totalCharacters += section.length;
    filesProcessed++;
  }

  const extractedText = sections.join("").trim();

  if (!extractedText) {
    throw createHttpError(
      "Could not extract readable content from this repository"
    );
  }

  return {
    extractedText,
    filesProcessed,
    commitSha,
  };
}

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

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (end >= text.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
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
    // Authenticate the current user.
    const decoded = authenticateRequest(req);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({
        error: "Invalid user identity",
      });
    }

    // Validate the submitted repository URL.
    const {
      owner,
      repo,
      sourceName,
      sourceUrl,
    } = validateRepositoryUrl(req.body?.url);

    await connectToDatabase();

    // Prevent the same user from adding the same repository twice.
    const existingRepository = await KnowledgeChunk.findOne({
      userId: new mongoose.Types.ObjectId(decoded.userId),
      sourceType: "github",
      sourceUrl,
    }).select("_id");

    if (existingRepository) {
      return res.status(409).json({
        error: "This GitHub repository has already been added to your knowledge base",
      });
    }

    // Extract repository files.
    const {
      extractedText,
      filesProcessed,
      commitSha,
    } = await extractRepositoryText(owner, repo);

    // Create overlapping text chunks.
    const chunks = splitIntoChunks(extractedText);

    if (chunks.length === 0) {
      return res.status(400).json({
        error: "Could not create text chunks from this repository",
      });
    }

    // Generate embeddings before saving the chunks.
    const documentsToSave = [];

    for (let index = 0; index < chunks.length; index++) {
      const embedding = await generateEmbedding(chunks[index]);

      documentsToSave.push({
        userId: new mongoose.Types.ObjectId(decoded.userId),
        sourceType: "github",
        sourceName: sourceName.slice(0, 200),
        sourceUrl,
        content: chunks[index],
        embedding,
        chunkIndex: index,
      });
    }

    // Save all repository chunks.
    const savedChunks = await KnowledgeChunk.insertMany(
      documentsToSave
    );

    return res.status(201).json({
      success: true,
      message: "GitHub repository processed and saved successfully",
      repository: {
        name: sourceName,
        url: sourceUrl,
        commit: commitSha,
        filesProcessed,
        chunksCreated: savedChunks.length,
        charactersExtracted: extractedText.length,
      },
    });
  } catch (error) {
    console.error("GitHub ingestion error:", error);

    return res.status(error.statusCode || 500).json({
      error:
        error.statusCode
          ? error.message
          : "Failed to process GitHub repository",
    });
  }
}
