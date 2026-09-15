import type { Request, Response } from "express";
import { z } from "zod";
import {
  createWebsite,
  deleteWebsite,
  getWebsite,
  getWebsites,
} from "../services/websites/website.service.js";

const websiteSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  url: z.string().url(),
});

export async function listWebsites(req: Request, res: Response) {
  const websites = await getWebsites(req.user!.id);

  res.json({ websites });
}

export async function getSingleWebsite(
  req: Request<{ id: string }>,
  res: Response,
) {
  const website = await getWebsite(req.params.id, req.user!.id);

  if (!website) {
    return res.status(404).json({
      message: "Website not found",
    });
  }

  res.json({ website });
}

export async function createNewWebsite(req: Request, res: Response) {
  const result = websiteSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid website data",
      errors: result.error.flatten(),
    });
  }

  try {
    const website = await createWebsite(
      req.user!.id,
      result.data.projectId,
      result.data.name,
      result.data.url,
    );

    res.status(201).json({ website });
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    throw error;
  }
}

export async function removeWebsite(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    await deleteWebsite(req.params.id, req.user!.id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "WEBSITE_NOT_FOUND") {
      return res.status(404).json({
        message: "Website not found",
      });
    }

    throw error;
  }
}
