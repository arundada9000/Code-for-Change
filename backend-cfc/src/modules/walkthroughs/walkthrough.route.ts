import { Router } from "express";
import { WalkthroughController } from "./walkthrough.controller.js";
import { upload } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { createWalkthroughSchema, updateWalkthroughSchema } from "./walkthrough.validation.js";

const router = Router();
const walkthroughController = new WalkthroughController();

// ─── Public Routes ──────────────────────────────────────────────────────────────
router.get("/walkthroughs", walkthroughController.getAllWalkthroughs);
router.get("/walkthroughs/slug/:slug", walkthroughController.getWalkthroughBySlug);
router.get("/walkthroughs/:id", walkthroughController.getWalkthroughById);

// ─── Protected Admin Routes ─────────────────────────────────────────────────────
router.post(
  "/walkthroughs",
  authenticate,
  requireAnyPermission(PERMISSIONS.WALKTHROUGH_CREATE),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "files", maxCount: 10 },
  ]),
  validate(createWalkthroughSchema),
  walkthroughController.createWalkthrough
);

router.put(
  "/walkthroughs/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.WALKTHROUGH_UPDATE),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "files", maxCount: 10 },
  ]),
  validate(updateWalkthroughSchema),
  walkthroughController.updateWalkthrough
);

router.patch(
  "/walkthroughs/:id/remove-file",
  authenticate,
  requireAnyPermission(PERMISSIONS.WALKTHROUGH_UPDATE),
  walkthroughController.removeFile
);

router.delete(
  "/walkthroughs/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.WALKTHROUGH_DELETE),
  walkthroughController.deleteWalkthrough
);

export default router;
