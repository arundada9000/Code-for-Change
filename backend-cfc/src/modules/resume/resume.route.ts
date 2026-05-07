import { Router } from "express";
import {
  listResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
} from "./resume.controller.js";
import { validateReqBody } from "../../shared/middlewares/validate.middleware.js";
import {
  createResumeSchema,
  updateResumeSchema,
} from "./resume.validation.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

// All resume routes require authentication
router.use(authenticate);

router.get("/", listResumes);
router.get("/:id", getResume);
router.post("/", validateReqBody(createResumeSchema), createResume);
router.patch("/:id", validateReqBody(updateResumeSchema), updateResume);
router.delete("/:id", deleteResume);
router.post("/:id/duplicate", duplicateResume);

export default router;
