const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Check API key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

// Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "My AI backend is running 🚀",
  });
});

// Chat API
app.post("/api/chat", async (req, res) => {
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

    const reply = response?.text || response?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("") || "I couldn’t generate a response right now.";

    console.log("AI response received");

    res.json({
      reply,
    });
  } catch (error) {
    console.error("❌ Gemini API Error:");
    console.error(error);

    res.status(500).json({
      error: "Something went wrong while talking to Gemini.",
      details: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});