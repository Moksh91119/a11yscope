import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getSingleScan, startScan } from "../controllers/scan.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/websites/:websiteId", startScan);

router.get("/:id", getSingleScan);

export default router;
