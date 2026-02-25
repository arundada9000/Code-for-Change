import { Router } from "express";
import { CertificateController } from "./certificate.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { validate, validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { issueCertificateSchema, updateCertificateStatusSchema, verifyCertificateSchema } from "./certificate.validation.js";

const router = Router();
const certificateController = new CertificateController();

/**
 * Public Routes
 */
router.get(
  "/verify/:token",
  validate(verifyCertificateSchema),
  certificateController.verifyCertificate
);

/**
 * Admin Routes
 */
router.post(
  "/issue",
  authenticate,
  requireAnyPermission(PERMISSIONS.CERTIFICATE_ISSUE),
  validate(issueCertificateSchema),
  certificateController.issueCertificate
);

router.get(
  "/ledger",
  authenticate,
  requireAnyPermission(PERMISSIONS.CERTIFICATE_VIEW),
  certificateController.getAllCertificates
);

router.patch(
  "/:id/status",
  authenticate,
  requireAnyPermission(PERMISSIONS.CERTIFICATE_UPDATE),
  validateMongoId(),
  validate(updateCertificateStatusSchema),
  certificateController.updateStatus
);

router.delete(
  "/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.CERTIFICATE_DELETE),
  validateMongoId(),
  certificateController.deleteCertificate
);

export default router;
