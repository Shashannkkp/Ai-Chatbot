
import { generateEmbedding } from "./lib/embeddings.js";

async function testEmbeddings() {
  try {
    const sampleText =
      "Nova-Ai is an AI chatbot developed by Shashank Patel.";

    console.log("Generating embedding...");

    const embedding = await generateEmbedding(sampleText);

    console.log("Embedding generated successfully!");
    console.log("Dimensions:", embedding.length);
    console.log("First 5 values:", embedding.slice(0, 5));

    if (embedding.length !== 768) {
      throw new Error("Incorrect embedding dimensions");
    }

    console.log("TEST PASSED!");
  } catch (error) {
    console.error("Embedding test failed:", error.message);
    process.exitCode = 1;
  }
}

testEmbeddings();
