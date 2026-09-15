import type { Request, Response } from "express";
import { z } from "zod";
import { loginUser, registerUser } from "../services/auth.service.js";
import { prisma } from "@a11yscope/database";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = authSchema.extend({
  name: z.string().min(2).max(100).optional(),
});

export async function register(req: Request, res: Response) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request",
      errors: result.error.flatten(),
    });
  }

  try {
    const data = await registerUser(
      result.data.email,
      result.data.password,
      result.data.name,
    );

    return res.status(201).json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function login(req: Request, res: Response) {
  const result = authSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request",
    });
  }

  try {
    const data = await loginUser(result.data.email, result.data.password);

    return res.json(data);
  } catch {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.json({ user });
}
