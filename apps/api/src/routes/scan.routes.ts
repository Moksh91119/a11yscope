import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getSingleScan,
  startScan,
  listWebsiteScans,
  compareScanResults,
} from "../controllers/scan.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/websites/:websiteId", listWebsiteScans);

router.get("/compare", compareScanResults);

router.get("/:id", getSingleScan);

router.get("/websites/:websiteId", listWebsiteScans);

export default router;
