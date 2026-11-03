import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "../lib/mongodb.js";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
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
    const { action, name, email, password } = req.body;

    if (!action || !email || !password) {
      return res.status(400).json({
        error: "Action, email and password are required",
      });
    }

    await connectToDatabase();

    // =========================
    // REGISTER
    // =========================

    if (action === "register") {
      if (!name) {
        return res.status(400).json({
          error: "Name is required",
        });
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      });

      if (existingUser) {
        return res.status(409).json({
          error: "User already exists",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
      });

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      });
    }

    // =========================
    // LOGIN
    // =========================

    if (action === "login") {
      const user = await User.findOne({
        email: email.toLowerCase(),
      });

      if (!user) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      const passwordMatch = await bcrypt.compare(
        password,
        user.passwordHash
      );

      if (!passwordMatch) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      });
    }

    return res.status(400).json({
      error: "Invalid action",
    });
  } catch (error) {
    console.error("Auth API Error:", error);

    return res.status(500).json({
      error: "Authentication failed",
    });
  }
}