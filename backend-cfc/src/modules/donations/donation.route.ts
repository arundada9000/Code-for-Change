import { Router } from "express";
import { z } from "zod";
import { DonationController } from "./donation.controller.js";
import { createDonationSchema, updateDonationStatusSchema, updateDonationSchema } from "./donation.validation.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { upload, validateFileMagicBytes } from "../../shared/middlewares/multer.js";
import { rateLimit } from "express-rate-limit";

const router = Router();
const donationController = new DonationController();

const donationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 donations per windowMs
  message: "Too many donation attempts from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Public route to record a donation
router.post(
  "/donations", 
  donationRateLimiter,
  upload.single('receipt'),
  validateFileMagicBytes,
  validate(createDonationSchema), 
  donationController.createDonation
);

// Admin routes (require authentication + permission)
router.get(
  "/admin/donations", 
  authenticate, 
  requireAnyPermission(PERMISSIONS.REPORT_VIEW),
  donationController.getAllDonations
);

router.get(
  "/admin/donations/stats", 
  authenticate, 
  requireAnyPermission(PERMISSIONS.REPORT_VIEW),
  donationController.getDonationStats
);

router.get(
  "/admin/donations/:id", 
  authenticate, 
  requireAnyPermission(PERMISSIONS.REPORT_VIEW),
  donationController.getDonationById
);

router.patch(
  "/admin/donations/:id/status", 
  authenticate, 
  requireAnyPermission(PERMISSIONS.SETTINGS_MANAGE),
  validate(updateDonationStatusSchema), 
  donationController.updateDonationStatus
);

router.put(
  "/admin/donations/:id", 
  authenticate, 
  requireAnyPermission(PERMISSIONS.SETTINGS_MANAGE),
  upload.single('receipt'),
  validateFileMagicBytes,
  validate(updateDonationSchema), 
  donationController.updateDonation
);

// eSewa Payment Routes
router.post(
  "/donations/initiate-esewa", 
  donationRateLimiter,
  validate(z.object({
    body: z.object({
      donorName: z.string().min(1, "Donor name is required"),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional().or(z.literal("")),
      amount: z.union([z.string(), z.number()]).transform((val) => Number(val)),
      category: z.string().optional(),
    })
  })),
  donationController.initiatePayment
);
router.get("/donations/verify-esewa", donationController.verifyPayment);

export default router;
