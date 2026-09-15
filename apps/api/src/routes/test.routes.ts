import { Router } from "express";
import { scanUrl } from "../scanner/scan.service.js";

const router = Router();

router.post("/scan", async (req, res) => {
  try {
    const { url } = req.body;

    if (typeof url !== "string") {
      return res.status(400).json({
        message: "url is required",
      });
    }

    const result = await scanUrl(url);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error instanceof Error ? error.message : "Scan failed",
    });
  }
});

export default router;
