
import formidable from "formidable";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { readFile, unlink } from "node:fs/promises";
import mongoose from "mongoose";

import { connectToDatabase } from "../lib/mongodb.js";
import { authenticateRequest } from "../lib/auth.js";
import { generateEmbedding } from "../lib/embeddings.js";
import KnowledgeChunk from "../models/KnowledgeChunk.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TEXT_LENGTH = 30000;

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

function getExtension(filename = "") {
  return filename.toLowerCase().slice(filename.lastIndexOf("."));
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

async function extractText(filePath, extension) {
  if (extension === ".txt") {
    return await readFile(filePath, "utf8");
  }

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value;
  }

  if (extension === ".pdf") {
    const buffer = await readFile(filePath);

    if (buffer.subarray(0, 5).toString() !== "%PDF-") {
      throw new Error("The uploaded file is not a valid PDF");
    }

    const parser = new PDFParse({
      data: buffer,
    });

    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("Unsupported file type");
}

function parseUploadedFile(req) {
  const form = formidable({
    uploadDir: undefined,
    maxFiles: 1,
    maxFileSize: MAX_FILE_SIZE,
    maxTotalFileSize: MAX_FILE_SIZE,
    maxFields: 5,
    allowEmptyFiles: false,
    minFileSize: 1,
    multiples: false,
  });

  return form.parse(req);
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

  let uploadedFilePath = null;

  try {
    // Authenticate before accepting an upload.
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

    // Receive the uploaded file.
    const [, files] = await parseUploadedFile(req);

    const uploadedFile = files.file;
    const file = Array.isArray(uploadedFile)
      ? uploadedFile[0]
      : uploadedFile;

    if (!file) {
      return res.status(400).json({
        error: "Please upload a file using the 'file' field",
      });
    }

    uploadedFilePath = file.filepath;

    const originalFilename =
      file.originalFilename || "uploaded-document";

    const extension = getExtension(originalFilename);

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return res.status(400).json({
        error: "Only PDF, DOCX, and TXT files are supported",
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        error: "File size cannot exceed 10 MB",
      });
    }

    // Extract document text.
    let extractedText = await extractText(
      uploadedFilePath,
      extension
    );

    extractedText = extractedText
      .replace(/\u0000/g, "")
      .replace(/\r\n/g, "\n")
      .trim();

    if (!extractedText) {
      return res.status(400).json({
        error: "No readable text found in the document",
      });
    }

    if (extractedText.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        error: "Document text is too large. The current limit is 30,000 characters.",
      });
    }

    // Split extracted text into overlapping chunks.
    const chunks = splitIntoChunks(extractedText);

    if (chunks.length === 0) {
      return res.status(400).json({
        error: "Could not create text chunks from this document",
      });
    }

    // Connect to MongoDB.
    await connectToDatabase();

    // Generate embeddings before saving anything.
    const documentsToSave = [];

    for (let index = 0; index < chunks.length; index++) {
      const embedding = await generateEmbedding(chunks[index]);

      documentsToSave.push({
        userId: new mongoose.Types.ObjectId(decoded.userId),
        sourceType: "document",
        sourceName: originalFilename.slice(0, 200),
        sourceUrl: null,
        content: chunks[index],
        embedding,
        chunkIndex: index,
      });
    }

    // Save all chunks for this document.
    const savedChunks = await KnowledgeChunk.insertMany(
      documentsToSave
    );

    return res.status(201).json({
      success: true,
      message: "Document processed and saved successfully",
      document: {
        name: originalFilename,
        type: extension.slice(1),
        chunksCreated: savedChunks.length,
        charactersExtracted: extractedText.length,
      },
    });
  } catch (error) {
    console.error("Knowledge upload error:", error);

    if (
      error.code === 1009 ||
      error.httpCode === 413 ||
      error.message?.toLowerCase().includes("maxfilesize")
    ) {
      return res.status(413).json({
        error: "File size cannot exceed 10 MB",
      });
    }

    if (error.message === "No file uploaded") {
      return res.status(400).json({
        error: "Please select a file to upload",
      });
    }

    return res.status(500).json({
      error: "Failed to process document",
    });
  } finally {
    if (uploadedFilePath) {
      try {
        await unlink(uploadedFilePath);
      } catch (cleanupError) {
        console.error(
          "Temporary file cleanup failed:",
          cleanupError.message
        );
      }
    }
  }
}
