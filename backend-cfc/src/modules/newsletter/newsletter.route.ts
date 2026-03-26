import { Router } from "express";
import { NewsletterController } from "./newsletter.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { subscribeSchema, updateSubscriberSchema } from "./newsletter.validation.js";

const router = Router();
const newsletterController = new NewsletterController();

// ─── Public Routes ─────────────────────────────────────────────────────────────
// Rate-limiting for spam prevention is applied at the app level (global /api limiter)
router.post(
  "/newsletter/subscribe",
  validate(subscribeSchema),
  newsletterController.subscribe
);

// ─── Admin Routes (Protected) ───────────────────────────────────────────────────
router.get(
  "/newsletter",
  authenticate,
  requireAnyPermission(PERMISSIONS.NEWSLETTER_VIEW),
  newsletterController.getAllSubscribers
);

router.get(
  "/newsletter/export",
  authenticate,
  requireAnyPermission(PERMISSIONS.NEWSLETTER_VIEW),
  newsletterController.exportSubscribers
);

router.get(
  "/newsletter/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.NEWSLETTER_VIEW),
  newsletterController.getSubscriberById
);

router.patch(
  "/newsletter/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.NEWSLETTER_UPDATE),
  validate(updateSubscriberSchema),
  newsletterController.updateSubscriber
);

router.delete(
  "/newsletter/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.NEWSLETTER_DELETE),
  newsletterController.deleteSubscriber
);

export default router;
