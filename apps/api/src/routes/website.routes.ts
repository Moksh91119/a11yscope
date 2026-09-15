import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createNewWebsite,
  getSingleWebsite,
  listWebsites,
  removeWebsite,
} from "../controllers/website.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", listWebsites);
router.post("/", createNewWebsite);
router.get("/:id", getSingleWebsite);
router.delete("/:id", removeWebsite);

export default router;
