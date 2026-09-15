import type { Request, Response } from "express";
import { createScan, getScan } from "../services/scans/scan.service.js";

export async function startScan(
  req: Request<{ websiteId: string }>,
  res: Response,
) {
  try {
    const scan = await createScan(req.user!.id, req.params.websiteId);

    return res.status(202).json({
      scan,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "WEBSITE_NOT_FOUND") {
      return res.status(404).json({
        message: "Website not found",
      });
    }

    throw error;
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
