import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = {
  userId: string;
};

export function signToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
