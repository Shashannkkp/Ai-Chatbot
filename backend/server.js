import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend environment variables
dotenv.config({
  path: path.join(__dirname, ".env"),
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Validate required environment variables
const requiredVariables = [
  "GEMINI_API_KEY",
  "MONGODB_URI",
  "JWT_SECRET",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    console.error(`Missing environment variable: ${variable}`);
    process.exit(1);
  }
}

// Import API handlers after loading environment variables
const [
  { default: authHandler },
  { default: chatHandler },
  { default: chatsHandler },
  { default: knowledgeHandler },
] = await Promise.all([
  import("./api/auth.js"),
  import("./api/chat.js"),
  import("./api/chats.js"),
  import("./api/knowledge.js"),
]);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Nova AI backend is running 🚀",
  });
});

// API routes
app.all("/api/auth", authHandler);
app.all("/api/chat", chatHandler);
app.all("/api/chats", chatsHandler);
app.all("/api/knowledge", knowledgeHandler);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  res.status(500).json({
    error: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nova AI backend running on port ${PORT}`);
});
