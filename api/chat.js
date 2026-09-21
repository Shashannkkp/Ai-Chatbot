import { GoogleGenAI } from "@google/genai";
import { connectToDatabase } from "../lib/mongodb.js";
import Chat from "../models/Chat.js";
import { authenticateRequest } from "../lib/auth.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

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
    const decoded = authenticateRequest(req);

    if (!decoded) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { message, chatId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    await connectToDatabase();

    let chat;

    if (chatId) {
      chat = await Chat.findOne({
        _id: chatId,
        userId: decoded.userId,
      });
    }

    if (!chat) {
      chat = new Chat({
        userId: decoded.userId,
        title: message.trim().slice(0, 50),
        messages: [],
      });
    }

    chat.messages.push({
      role: "user",
      content: message.trim(),
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message.trim(),
    });

    const reply =
      response.text ||
      "Sorry, I couldn't generate a response.";

    chat.messages.push({
      role: "assistant",
      content: reply,
    });

    await chat.save();

    return res.status(200).json({
      reply,
      chat: {
        id: chat._id.toString(),
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    return res.status(500).json({
      error: "Failed to process chat",
    });
  }
}