import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createNewProject,
  getSingleProject,
  listProjects,
  removeProject,
} from "../controllers/project.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", listProjects);
router.post("/", createNewProject);
router.get("/:id", getSingleProject);
router.delete("/:id", removeProject);

export default router;
