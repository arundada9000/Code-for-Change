import { validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { Router } from "express";
import { TestimonialController } from "./testimonial.controller.js";
import { upload, validateFileMagicBytes } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { createTestimonialSchema, updateTestimonialSchema } from "./testimonial.validation.js";

const router = Router();
const testimonialController = new TestimonialController();

// Public routes
router.get("/testimonials", testimonialController.getActiveTestimonials);

// Admin routes
router.get("/testimonials/admin/all", authenticate, requireAnyPermission(PERMISSIONS.TESTIMONIAL_VIEW), testimonialController.getAllTestimonials);
router.get("/testimonials/:id", validateMongoId(), authenticate, requireAnyPermission(PERMISSIONS.TESTIMONIAL_VIEW), testimonialController.getTestimonialById);
router.post("/testimonials", authenticate, requireAnyPermission(PERMISSIONS.TESTIMONIAL_CREATE), upload.single("image"), validateFileMagicBytes, validate(createTestimonialSchema), testimonialController.createTestimonial);
router.put("/testimonials/:id", validateMongoId(), authenticate, requireAnyPermission(PERMISSIONS.TESTIMONIAL_UPDATE), upload.single("image"), validateFileMagicBytes, validate(updateTestimonialSchema), testimonialController.updateTestimonial);
router.delete("/testimonials/:id", validateMongoId(), authenticate, requireAnyPermission(PERMISSIONS.TESTIMONIAL_DELETE), testimonialController.deleteTestimonial);

export default router;
