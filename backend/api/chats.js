import { connectToDatabase } from "../lib/mongodb.js";
import Chat from "../models/Chat.js";
import { authenticateRequest } from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!["GET", "DELETE"].includes(req.method)) {
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

    await connectToDatabase();

    if (req.method === "DELETE") {
      const chatId = req.query?.id;

      if (!chatId) {
        return res.status(400).json({
          error: "Chat id is required",
        });
      }

      const deletedChat = await Chat.findOneAndDelete({
        _id: chatId,
        userId: decoded.userId,
      });

      if (!deletedChat) {
        return res.status(404).json({
          error: "Chat not found",
        });
      }

      return res.status(200).json({
        success: true,
      });
    }

    const chats = await Chat.find({
      userId: decoded.userId,
    })
      .sort({ updatedAt: -1 })
      .lean();

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