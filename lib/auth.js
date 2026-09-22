import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function authenticateRequest(req) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);

 try {
  return jwt.verify(token, JWT_SECRET);
} catch (error) {
  console.error("JWT verification failed:", {
    name: error.name,
    message: error.message,
  });

  return null;
}
}