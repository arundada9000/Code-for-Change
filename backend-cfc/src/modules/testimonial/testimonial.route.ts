import { Router } from "express";
import { TestimonialController } from "./testimonial.controller.js";
import { upload } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";

const router = Router();
const testimonialController = new TestimonialController();

// Public routes
router.get("/testimonials", testimonialController.getActiveTestimonials);

// Admin routes
router.get("/testimonials/admin/all", authenticate, requireAnyPermission(PERMISSIONS.TESTIMONIAL_VIEW), testimonialController.getAllTestimonials);
router.get("/testimonials/:id", authenticate, requireAnyPermission(PERMISSIONS.TESTIMONIAL_VIEW), testimonialController.getTestimonialById);
router.post("/testimonials", authenticate, requireAnyPermission(PERMISSIONS.TESTIMONIAL_CREATE), upload.single("image"), testimonialController.createTestimonial);
router.put("/testimonials/:id", authenticate, requireAnyPermission(PERMISSIONS.TESTIMONIAL_UPDATE), upload.single("image"), testimonialController.updateTestimonial);
router.delete("/testimonials/:id", authenticate, requireAnyPermission(PERMISSIONS.TESTIMONIAL_DELETE), testimonialController.deleteTestimonial);

export default router;
