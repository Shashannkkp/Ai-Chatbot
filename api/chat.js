import { GoogleGenAI } from "@google/genai";

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

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    return res.status(500).json({
      error: "Something went wrong while talking to Gemini.",
      details: error?.message || "Unknown error",
    });
  }
}