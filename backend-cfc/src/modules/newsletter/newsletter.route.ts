import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { NewsletterController } from "./newsletter.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import {
  subscribeSchema,
  updateSubscriberSchema,
} from "./newsletter.validation.js";

const router = Router();
const newsletterController = new NewsletterController();

// ─── Per-IP Rate Limiter for Subscribe ─────────────────────────────────────────
// Max 2 subscription attempts per IP per 60 minutes to prevent spam/abuse.
const subscribeRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message:
      "Too many subscription attempts from this IP. Please try again in 15 minutes.",
  },
  keyGenerator: (req) => req.ip || "unknown",
});

// ─── Public Routes ──────────────────────────────────────────────────────────────
router.post(
  "/newsletter/subscribe",
  subscribeRateLimiter, // Strict per-IP: 2 req / 60 min
  validate(subscribeSchema), // Format + disposable email check
  newsletterController.subscribe, // MX record DNS check inside service
);

// ─── Admin Routes (Protected) ───────────────────────────────────────────────────
router.get(
  "/newsletter",
  authenticate,
  requireAnyPermission(PERMISSIONS.NEWSLETTER_VIEW),
  newsletterController.getAllSubscribers,
);

router.get(
  "/newsletter/export",
  authenticate,
  requireAnyPermission(PERMISSIONS.NEWSLETTER_VIEW),
  newsletterController.exportSubscribers,
);

router.get(
  "/newsletter/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.NEWSLETTER_VIEW),
  newsletterController.getSubscriberById,
);

router.patch(
  "/newsletter/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.NEWSLETTER_UPDATE),
  validate(updateSubscriberSchema),
  newsletterController.updateSubscriber,
);

router.delete(
  "/newsletter/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.NEWSLETTER_DELETE),
  newsletterController.deleteSubscriber,
);

export default router;
