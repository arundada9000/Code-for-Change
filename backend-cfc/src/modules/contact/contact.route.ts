import { validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { ContactController } from "./contact.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { createContactSchema } from "./contact.validation.js";

const router = Router();
const contactController = new ContactController();

// ─── Per-IP Rate Limiter for Contact Form ────────────────────────────────────
// Max 3 contact form submissions per IP per 60 minutes.
const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "You have submitted too many messages. Please try again later.",
  },
});

router.get("/contacts", authenticate, requireAnyPermission(PERMISSIONS.CONTACT_VIEW), contactController.getAllContacts);
router.get("/contacts/:id", validateMongoId(), authenticate, requireAnyPermission(PERMISSIONS.CONTACT_VIEW), contactController.getContactById);
router.post("/contacts", contactRateLimiter, validate(createContactSchema), contactController.createContact);
router.patch("/contacts/:id/read", validateMongoId(), authenticate, requireAnyPermission(PERMISSIONS.CONTACT_VIEW), contactController.markAsRead);
router.delete("/contacts/:id", validateMongoId(), authenticate, requireAnyPermission(PERMISSIONS.CONTACT_DELETE), contactController.deleteContact);

export default router;
