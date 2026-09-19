import { GoogleGenAI } from "@google/genai";
import { connectToDatabase } from "../lib/mongodb.js";
import Chat from "../models/Chat.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Browser preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    console.log("User:", message);

    // Connect to MongoDB
    await connectToDatabase();

    // Create a new chat with the user's message
    const chat = await Chat.create({
      messages: [
        {
          role: "user",
          content: message.trim(),
        },
      ],
    });

    // Send message to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message.trim(),
    });

    const reply =
      response?.text ||
      response?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || "")
        .join("") ||
      "I couldn't generate a response right now.";

    // Save Gemini's response
    chat.messages.push({
      role: "assistant",
      content: reply,
    });

    await chat.save();

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    return res.status(500).json({
      error: "Something went wrong while processing your request.",
      details: error?.message || "Unknown error",
    });
  }
}

//new