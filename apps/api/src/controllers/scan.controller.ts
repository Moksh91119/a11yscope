import type { Request, Response } from "express";
import {
  createScan,
  getScan,
  getWebsiteScans,
  compareScans,
} from "../services/scans/scan.service.js";

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

export async function listWebsiteScans(
  req: Request<{ websiteId: string }>,
  res: Response,
) {
  try {
    const scans = await getWebsiteScans(req.user!.id, req.params.websiteId);

    res.json(scans);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load scan history",
    });
  }
}

export async function compareScanResults(req: Request, res: Response) {
  try {
    const { baseScanId, currentScanId } = req.query;

    if (typeof baseScanId !== "string" || typeof currentScanId !== "string") {
      res.status(400).json({
        message: "baseScanId and currentScanId are required",
      });
      return;
    }

    const comparison = await compareScans(
      req.user!.id,
      baseScanId,
      currentScanId,
    );

    res.json(comparison);
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === "SCANS_NOT_FOUND") {
        res.status(404).json({
          message: "Scans not found",
        });
        return;
      }

      if (error.message === "SCANS_NOT_COMPLETED") {
        res.status(400).json({
          message: "Both scans must be completed",
        });
        return;
      }

      if (error.message === "DIFFERENT_WEBSITES") {
        res.status(400).json({
          message: "Scans must belong to the same website",
        });
        return;
      }
    }

    res.status(500).json({
      message: "Failed to compare scans",
    });
  }
}
