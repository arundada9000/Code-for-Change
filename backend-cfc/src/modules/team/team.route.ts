import { validateMongoId } from "../../shared/middlewares/validate.middleware.js";
import { Router } from "express";
import { TeamController } from "./team.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { upload, validateFileMagicBytes } from "../../shared/middlewares/multer.js";

const router = Router();
const teamController = new TeamController();

// Public routes
router.get("/", teamController.getAllMembers);
router.get("/:id", validateMongoId(), teamController.getMemberById);

// Protected routes (Superadmin / Admin using TEAM permissions)
router.post(
  "/",
  authenticate,
  requireAnyPermission(PERMISSIONS.TEAM_CREATE),
  upload.single("image"), validateFileMagicBytes,
  teamController.createMember
);

router.put(
  "/:id", validateMongoId(),
  authenticate,
  requireAnyPermission(PERMISSIONS.TEAM_UPDATE),
  upload.single("image"), validateFileMagicBytes,
  teamController.updateMember
);

router.delete(
  "/:id", validateMongoId(),
  authenticate,
  requireAnyPermission(PERMISSIONS.TEAM_DELETE),
  teamController.deleteMember
);

export default router;
