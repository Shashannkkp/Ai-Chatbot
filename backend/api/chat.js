
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

const CREATOR_REPLY =
  "I was created and developed by Shashank Patel, a passionate software developer. He built me to provide helpful answers, assist with coding, and make everyday tasks easier!";



function isCreatorQuestion(message) {
  const text = message.toLowerCase().trim();

  const patterns = [
    /\bwho\s+(made|created|built|developed|designed)\s+(you|nova[- ]?ai)\b/i,

    /\bwho\s+own(?:s|['’]s)?\s+(you|nova[- ]?ai)\b/i,

    /\bwho\s+is\s+(?:the\s+)?(?:owner|creator|developer|maker|founder)\s+of\s+(you|nova[- ]?ai)\b/i,

    /\bwho\s+is\s+(your|nova[- ]?ai'?s)\s+(creator|developer|maker|founder|owner)\b/i,

    /\bwho\s+is\s+behind\s+(you|nova[- ]?ai)\b/i,

    /\bcreator\s+of\s+(you|nova[- ]?ai)\b/i,

    /\bdeveloper\s+of\s+(you|nova[- ]?ai)\b/i,
  ];

  return patterns.some((pattern) => pattern.test(text));
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

  try {
    const decoded = authenticateRequest(req);

    if (req.headers?.authorization && !decoded) {
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

    const userMessage = message.trim();

    // Check whether the user is asking about Nova-Ai's creator.
    const isAskingAboutCreator = isCreatorQuestion(userMessage);

    // Guest user (not logged in).
    if (!decoded) {
      if (isAskingAboutCreator) {
        return res.status(200).json({
          reply: CREATOR_REPLY,
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userMessage,
      });

      return res.status(200).json({
        reply:
          response.text ||
          "Sorry, I couldn't generate a response.",
      });
    }

    // Logged-in user.
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
        title: userMessage.slice(0, 50),
        messages: [],
      });
    }

    chat.messages.push({
      role: "user",
      content: userMessage,
    });

    let reply;

    if (isAskingAboutCreator) {
      // Return the predefined creator response.
      reply = CREATOR_REPLY;
    } else {
      // Existing Gemini functionality remains unchanged.
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userMessage,
      });

      reply =
        response.text ||
        "Sorry, I couldn't generate a response.";
    }

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
