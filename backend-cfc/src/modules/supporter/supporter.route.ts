import { Router } from "express";
import { SupporterController } from "./supporter.controller.js";
import { upload } from "../../shared/middlewares/multer.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";

const router = Router();
const supporterController = new SupporterController();

// Public routes
router.get("/supporters", supporterController.getActiveSupporters);

// Admin routes
router.get("/supporters/admin/all", authenticate, requireAnyPermission(PERMISSIONS.SUPPORTER_VIEW), supporterController.getAllSupporters);
router.get("/supporters/:id", authenticate, requireAnyPermission(PERMISSIONS.SUPPORTER_VIEW), supporterController.getSupporterById);
router.post("/supporters", authenticate, requireAnyPermission(PERMISSIONS.SUPPORTER_CREATE), upload.single("logo"), supporterController.createSupporter);
router.put("/supporters/:id", authenticate, requireAnyPermission(PERMISSIONS.SUPPORTER_UPDATE), upload.single("logo"), supporterController.updateSupporter);
router.delete("/supporters/:id", authenticate, requireAnyPermission(PERMISSIONS.SUPPORTER_DELETE), supporterController.deleteSupporter);

export default router;
