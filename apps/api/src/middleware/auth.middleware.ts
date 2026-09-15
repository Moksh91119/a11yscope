import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = header.substring(7);

  try {
    const payload = verifyToken(token);

    req.user = {
      id: payload.userId,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
