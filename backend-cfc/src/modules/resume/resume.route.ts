import { validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { Router } from "express";
import {
  listResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
  adminListResumes,
  adminDeleteResume,
} from "./resume.controller.js";
import { validateReqBody } from "../../shared/middlewares/validate.middleware.js";
import {
  createResumeSchema,
  updateResumeSchema,
} from "./resume.validation.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";

const router = Router();

// All resume routes require authentication
router.use(authenticate);

// Admin routes (must be before /:id to avoid matching "admin" as an id)
router.get("/admin/all", requireAnyPermission("user:view" as any), adminListResumes);
router.delete("/admin/:id", validateMongoId(), requireAnyPermission("user:delete" as any), adminDeleteResume);

// User routes
router.get("/", listResumes);
router.get("/:id", validateMongoId(), getResume);
router.post("/", validateReqBody(createResumeSchema), createResume);
router.patch("/:id", validateMongoId(), validateReqBody(updateResumeSchema), updateResume);
router.delete("/:id", validateMongoId(), deleteResume);
router.post("/:id/duplicate", validateMongoId(), duplicateResume);

export default router;
