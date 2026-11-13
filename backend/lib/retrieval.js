
import mongoose from "mongoose";

import { generateEmbedding } from "./embeddings.js";
import KnowledgeChunk from "../models/KnowledgeChunk.js";

const VECTOR_INDEX_NAME = "knowledge_vector_index";
const MAX_RESULTS = 5;
const NUM_CANDIDATES = 100;

export async function retrieveRelevantKnowledge(
  userId,
  question,
  limit = MAX_RESULTS
) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID for knowledge retrieval");
  }

  if (
    typeof question !== "string" ||
    !question.trim()
  ) {
    throw new Error("A valid question is required");
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || MAX_RESULTS, 1),
    MAX_RESULTS
  );

  // Generate an embedding for the user's question.
  const queryEmbedding = await generateEmbedding(question);

  // Search only the authenticated user's knowledge.
  const results = await KnowledgeChunk.aggregate([
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: NUM_CANDIDATES,
        limit: safeLimit,
        filter: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
    },
    {
      $project: {
        _id: 1,
        sourceType: 1,
        sourceName: 1,
        sourceUrl: 1,
        content: 1,
        chunkIndex: 1,
        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
  ]);

  return results;
}
