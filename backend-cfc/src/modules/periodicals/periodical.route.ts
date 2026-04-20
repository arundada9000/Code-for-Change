import { Router } from "express";
import { PeriodicalController } from "./periodical.controller.js";
import { upload } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { createPeriodicalSchema, updatePeriodicalSchema } from "./periodical.validation.js";

const router = Router();
const periodicalController = new PeriodicalController();

// ─── Public Routes ──────────────────────────────────────────────────────────────
router.get("/periodicals", periodicalController.getAllPeriodicals);
router.get("/periodicals/slug/:slug", periodicalController.getPeriodicalBySlug);
router.get("/periodicals/:id", periodicalController.getPeriodicalById);

// ─── Protected Admin Routes ─────────────────────────────────────────────────────
router.post(
  "/periodicals",
  authenticate,
  requireAnyPermission(PERMISSIONS.PERIODICAL_CREATE),
  upload.array("files", 10),
  validate(createPeriodicalSchema),
  periodicalController.createPeriodical
);

router.put(
  "/periodicals/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.PERIODICAL_UPDATE),
  upload.array("files", 10),
  validate(updatePeriodicalSchema),
  periodicalController.updatePeriodical
);

router.patch(
  "/periodicals/:id/remove-file",
  authenticate,
  requireAnyPermission(PERMISSIONS.PERIODICAL_UPDATE),
  periodicalController.removeFile
);

router.delete(
  "/periodicals/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.PERIODICAL_DELETE),
  periodicalController.deletePeriodical
);

export default router;
