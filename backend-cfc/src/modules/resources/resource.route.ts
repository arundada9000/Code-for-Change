import { validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { Router } from "express";
import { ResourceController } from "./resource.controller.js";
import { upload, validateFileMagicBytes } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { createResourceSchema, updateResourceSchema } from "./resource.validation.js";

const router = Router();
const resourceController = new ResourceController();

// ─────────────────────────────────────────────────────────
// Public (role-filtered) – optionally authenticated
// The controller reads req.user?.role, falling back to "guest"
// so this single endpoint handles both cases.
// ─────────────────────────────────────────────────────────
router.get("/resources", (req, res, next) => {
  // Try to authenticate but don't block if no token exists
  authenticate(req as any, res, (err) => {
    if (err) {
      // No valid token – continue as guest
      (req as any).user = undefined;
    }
    next();
  });
}, resourceController.getAllResources);

router.get("/resources/:id", validateMongoId(), (req, res, next) => {
  authenticate(req as any, res, (err) => {
    if (err) (req as any).user = undefined;
    next();
  });
}, resourceController.getResourceById);

// Track download (accessible to anyone who can see the resource)
router.post("/resources/:id/download", validateMongoId(), (req, res, next) => {
  authenticate(req as any, res, (err) => {
    if (err) (req as any).user = undefined;
    next();
  });
}, resourceController.trackDownload);

// ─────────────────────────────────────────────────────────
// Admin-only (write) routes
// ─────────────────────────────────────────────────────────
router.post(
  "/resources",
  authenticate,
  requireAnyPermission(PERMISSIONS.RESOURCE_CREATE),
  upload.single("file"), validateFileMagicBytes,
  validate(createResourceSchema),
  resourceController.createResource
);

router.put(
  "/resources/:id", validateMongoId(),
  authenticate,
  requireAnyPermission(PERMISSIONS.RESOURCE_UPDATE),
  upload.single("file"), validateFileMagicBytes,
  validate(updateResourceSchema),
  resourceController.updateResource
);

router.delete(
  "/resources/:id", validateMongoId(),
  authenticate,
  requireAnyPermission(PERMISSIONS.RESOURCE_DELETE),
  resourceController.deleteResource
);

export default router;
