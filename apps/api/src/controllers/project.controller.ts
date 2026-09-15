import type { Request, Response } from "express";
import { z } from "zod";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
} from "../services/projects/project.service.js";

const projectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
});

export async function listProjects(req: Request, res: Response) {
  const projects = await getProjects(req.user!.id);

  res.json({ projects });
}

export async function getSingleProject(
  req: Request<{ id: string }>,
  res: Response,
) {
  const project = await getProject(req.params.id, req.user!.id);

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
    });
  }

  res.json({ project });
}

export async function createNewProject(req: Request, res: Response) {
  const result = projectSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid project data",
      errors: result.error.flatten(),
    });
  }

  const project = await createProject(
    req.user!.id,
    result.data.name,
    result.data.description,
  );

  res.status(201).json({ project });
}

export async function removeProject(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    await deleteProject(req.params.id, req.user!.id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    throw error;
  }
}
