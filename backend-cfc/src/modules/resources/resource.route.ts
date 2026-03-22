import { Router } from "express";
import { ResourceController } from "./resource.controller.js";
import { upload } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";

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

router.get("/resources/:id", (req, res, next) => {
  authenticate(req as any, res, (err) => {
    if (err) (req as any).user = undefined;
    next();
  });
}, resourceController.getResourceById);

// Track download (accessible to anyone who can see the resource)
router.post("/resources/:id/download", (req, res, next) => {
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
  upload.single("file"),
  resourceController.createResource
);

router.put(
  "/resources/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.RESOURCE_UPDATE),
  upload.single("file"),
  resourceController.updateResource
);

router.delete(
  "/resources/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.RESOURCE_DELETE),
  resourceController.deleteResource
);

export default router;
