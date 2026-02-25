import { Router } from "express";
import { ApplicationController } from "./application.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { validate, validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { upload } from "../../shared/middlewares/multer.js";
import { createApplicationSchema, updateApplicationStatusSchema } from "./application.validation.js";

const router = Router();
const applicationController = new ApplicationController();

/**
 * @route   POST /api/internships/applications
 * @desc    Submit internship application (Public)
 * @access  Public
 */
router.post(
  "/applications",
  upload.single("resume"),
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
  "/applications/:id/status",
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
  "/applications/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.INTERNSHIP_DELETE),
  validateMongoId(),
  applicationController.deleteApplication
);

export default router;
