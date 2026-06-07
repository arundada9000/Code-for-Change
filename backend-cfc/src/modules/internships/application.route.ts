import { Router } from "express";
import { ApplicationController } from "./application.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { validate, validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { upload, validateFileMagicBytes } from "../../shared/middlewares/multer.js";
import { createApplicationSchema, updateApplicationStatusSchema } from "./application.validation.js";
import { rateLimit } from "express-rate-limit";

const router = Router();
const applicationController = new ApplicationController();

const applicationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: "Too many internship applications created from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/internships/applications
 * @desc    Submit internship application (Public)
 * @access  Public
 */
router.post(
  "/applications",
  applicationRateLimiter,
  upload.single("resume"), validateFileMagicBytes,
  validate(createApplicationSchema),
  applicationController.submitApplication
);

/**
 * @route   GET /api/internships/applications
 * @desc    Get all applications
 * @access  Admin (INTERNSHIP_VIEW)
 */
router.get(
  "/applications",
  authenticate,
  requireAnyPermission(PERMISSIONS.INTERNSHIP_VIEW),
  applicationController.getAllApplications
);

/**
 * @route   PATCH /api/internships/applications/:id/status
 * @desc    Update application status
 * @access  Admin (INTERNSHIP_UPDATE)
 */
router.patch(
  "/applications/:id/status", validateMongoId(),
  authenticate,
  requireAnyPermission(PERMISSIONS.INTERNSHIP_UPDATE),
  validateMongoId(),
  validate(updateApplicationStatusSchema),
  applicationController.updateStatus
);

/**
 * @route   DELETE /api/internships/applications/:id
 * @desc    Delete application
 * @access  Admin (INTERNSHIP_DELETE)
 */
router.delete(
  "/applications/:id", validateMongoId(),
  authenticate,
  requireAnyPermission(PERMISSIONS.INTERNSHIP_DELETE),
  validateMongoId(),
  applicationController.deleteApplication
);

export default router;
