import { Router } from "express";
import { InternshipController } from "./internship.controller.js";
import { upload, validateFileMagicBytes } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate, validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { createInternshipSchema, updateInternshipSchema } from "./internship.validation.js";

const router = Router();
const internshipController = new InternshipController();

/**
 * @route   GET /api/internships
 * @desc    Get all internships
 * @access  Public
 */
router.get("/internships", internshipController.getAllInternships);
router.get("/internships/:id", validateMongoId(), internshipController.getInternshipById);

/**
 * Admin Routes
 */
router.post(
  "/internships", 
  authenticate, 
  requireAnyPermission(PERMISSIONS.INTERNSHIP_CREATE), 
  upload.single("companyLogo"), validateFileMagicBytes, 
  validate(createInternshipSchema), 
  internshipController.createInternship
);

router.put(
  "/internships/:id", validateMongoId(), 
  authenticate, 
  requireAnyPermission(PERMISSIONS.INTERNSHIP_UPDATE), 
  validateMongoId(), 
  upload.single("companyLogo"), validateFileMagicBytes, 
  validate(updateInternshipSchema), 
  internshipController.updateInternship
);

router.delete(
  "/internships/:id", validateMongoId(), 
  authenticate, 
  requireAnyPermission(PERMISSIONS.INTERNSHIP_DELETE), 
  validateMongoId(), 
  internshipController.deleteInternship
);

export default router;
