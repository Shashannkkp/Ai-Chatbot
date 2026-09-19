import { connectToDatabase } from "../lib/mongodb.js";
import Chat from "../models/Chat.js";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Get all chats, newest first
    const chats = await Chat.find({})
      .sort({ updatedAt: -1 })
      .lean();

    // Convert MongoDB documents into frontend-friendly objects
    const formattedChats = chats.map((chat) => {
      const firstUserMessage = chat.messages?.find(
        (message) => message.role === "user"
      );

      return {
        id: chat._id.toString(),

        title:
          chat.title ||
          firstUserMessage?.content?.trim().slice(0, 50) ||
          "New Conversation",

        messages: chat.messages || [],

        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      };
    });

    return res.status(200).json({
      chats: formattedChats,
    });
  } catch (error) {
    console.error("Failed to fetch chats:", error);

    return res.status(500).json({
      error: "Failed to fetch chats",
    });
  }
}