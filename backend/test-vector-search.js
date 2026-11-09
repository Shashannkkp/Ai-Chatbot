import "./lib/dns-config.js";

import "dotenv/config";

import mongoose from "mongoose";
import { connectToDatabase } from "./lib/mongodb.js";
import { generateEmbedding } from "./lib/embeddings.js";
import KnowledgeChunk from "./models/KnowledgeChunk.js";

async function testVectorSearch() {
  try {
    console.log("Connecting to MongoDB...");

    await connectToDatabase();

    // Find an existing user without modifying user data.
    const existingUser = await mongoose.connection
      .collection("users")
      .findOne({}, { projection: { _id: 1 } });

    if (!existingUser) {
      throw new Error("No existing user found in the users collection");
    }

    const userId = existingUser._id;

    const sampleText =
      "Nova-Ai is an AI chatbot developed by Shashank Patel. It helps users with coding, learning, and everyday tasks.";

    console.log("Generating sample embedding...");

    const embedding = await generateEmbedding(sampleText);

    console.log("Saving sample knowledge chunk...");

    // Remove only the previous test record, if it exists.
    await KnowledgeChunk.deleteOne({
      userId,
      sourceName: "Nova-Ai RAG Test",
    });

    await KnowledgeChunk.create({
      userId,
      sourceType: "document",
      sourceName: "Nova-Ai RAG Test",
      content: sampleText,
      embedding,
      chunkIndex: 0,
    });

    console.log("Sample knowledge chunk saved!");

    // Verify that the sample document exists in MongoDB.
const savedCount = await KnowledgeChunk.countDocuments({
  userId,
  sourceName: "Nova-Ai RAG Test",
});

console.log("Saved test documents:", savedCount);

// Atlas Vector Search indexing is asynchronous.
// Wait briefly before searching.
console.log("Waiting 10 seconds for Vector Search indexing...");

await new Promise((resolve) => setTimeout(resolve, 10000));

    const question = "Who developed Nova-Ai?";

    console.log("Generating question embedding...");

    const queryEmbedding = await generateEmbedding(question);

    console.log("Searching MongoDB Vector Search...");

    const results = await KnowledgeChunk.aggregate([
      {
        $vectorSearch: {
          index: "knowledge_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 20,
          limit: 3,
          filter: {
            userId,
          },
        },
      },
      {
        $project: {
          sourceName: 1,
          content: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ]);

    console.log("\nSearch results:");

    console.log(JSON.stringify(results, null, 2));

    if (results.length === 0) {
      throw new Error(
        "No results found. Check that the Vector Search index is READY."
      );
    }

    console.log("\nVECTOR SEARCH TEST PASSED!");
  } catch (error) {
    console.error("\nVector Search test failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

testVectorSearch();
