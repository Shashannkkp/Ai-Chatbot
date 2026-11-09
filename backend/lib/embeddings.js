
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

const EMBEDDING_MODEL = "gemini-embedding-2";
const EMBEDDING_DIMENSIONS = 768;

export async function generateEmbedding(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Text is required to generate an embedding");
  }

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text.trim(),
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (
    !embedding ||
    embedding.length !== EMBEDDING_DIMENSIONS
  ) {
    throw new Error("Failed to generate a valid embedding");
  }

  return embedding;
}
