
import "./lib/dns-config.js";
import "dotenv/config";

import mongoose from "mongoose";

import { connectToDatabase } from "./lib/mongodb.js";
import KnowledgeChunk from "./models/KnowledgeChunk.js";
import { retrieveRelevantKnowledge } from "./lib/retrieval.js";

async function testRetrieval() {
  try {
    console.log("Connecting to MongoDB...");

    await connectToDatabase();

    // Find existing knowledge without modifying the database.
    const sampleChunk = await KnowledgeChunk.findOne({
      sourceType: {
        $in: ["document", "website", "github"],
      },
    }).lean();

    if (!sampleChunk) {
      throw new Error(
        "No existing knowledge chunks found. Add a document, website, or GitHub repository first."
      );
    }

    console.log("\nFound existing knowledge:");
    console.log("Source:", sampleChunk.sourceName);
    console.log("Type:", sampleChunk.sourceType);

    // Test 1: A question based on existing knowledge.
    const relevantQuestion = sampleChunk.content.slice(0, 300);

    // Test 2: An unrelated general question.
    const unrelatedQuestion =
      "How do I bake a chocolate cake?";

    console.log("\n==================================");
    console.log("TEST 1: RELEVANT QUESTION");
    console.log("==================================");

    console.log("\nQuestion:");
    console.log(relevantQuestion);

    const relevantResults = await retrieveRelevantKnowledge(
      sampleChunk.userId.toString(),
      relevantQuestion
    );

    console.log("\nRelevant search results:");

    console.log(
      JSON.stringify(
        relevantResults.map((result) => ({
          sourceName: result.sourceName,
          sourceType: result.sourceType,
          score: result.score,
          content: result.content,
        })),
        null,
        2
      )
    );

    console.log("\n==================================");
    console.log("TEST 2: UNRELATED QUESTION");
    console.log("==================================");

    console.log("\nQuestion:");
    console.log(unrelatedQuestion);

    const unrelatedResults = await retrieveRelevantKnowledge(
      sampleChunk.userId.toString(),
      unrelatedQuestion
    );

    console.log("\nUnrelated search results:");

    console.log(
      JSON.stringify(
        unrelatedResults.map((result) => ({
          sourceName: result.sourceName,
          sourceType: result.sourceType,
          score: result.score,
          content: result.content,
        })),
        null,
        2
      )
    );

    console.log("\n==================================");
    console.log("RETRIEVAL COMPARISON");
    console.log("==================================");

    console.log(
      "Best relevant score:",
      relevantResults[0]?.score ?? "No results"
    );

    console.log(
      "Best unrelated score:",
      unrelatedResults[0]?.score ?? "No results"
    );

    console.log("\nRETRIEVAL COMPARISON COMPLETED!");
  } catch (error) {
    console.error("\nRetrieval test failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

testRetrieval();
