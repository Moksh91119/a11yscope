import type { Request, Response } from "express";
import { createScan, getScan } from "../services/scans/scan.service.js";

export async function startScan(
  req: Request<{ websiteId: string }>,
  res: Response,
) {
  try {
    const userId = req.user!.id;

    const scan = await createScan(userId, req.params.websiteId);

    res.status(201).json(scan);
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "WEBSITE_NOT_FOUND") {
      res.status(404).json({
        message: "Website not found",
      });
      return;
    }

    res.status(500).json({
      message: "Failed to start scan",
    });
  }
}

export async function getSingleScan(
  req: Request<{ id: string }>,
  res: Response,
) {
  const scan = await getScan(req.params.id, req.user!.id);

  if (!scan) {
    return res.status(404).json({
      message: "Scan not found",
    });
  }

  return res.json({ scan });
}
