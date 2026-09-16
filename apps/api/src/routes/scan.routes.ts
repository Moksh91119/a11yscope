import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getSingleScan,
  startScan,
  listWebsiteScans,
} from "../controllers/scan.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/websites/:websiteId", startScan);

router.get("/:id", getSingleScan);

router.get("/websites/:websiteId", listWebsiteScans);

export default router;
