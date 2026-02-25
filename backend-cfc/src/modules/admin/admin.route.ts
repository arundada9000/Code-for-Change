import { Router } from "express";
import { AdminController } from "./admin.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { upload } from "../../shared/middlewares/multer.js";
import { createUserController, updateUserController } from "../user/user.controller.js";

const router = Router();
const adminController = new AdminController();

router.get("/admin/dashboard", adminController.getDashboardStats);
router.get("/admin/content", adminController.getAllContent);

// User & Member Management
router.post(
  "/admin/users/create-user",
  authenticate,
  requireAnyPermission(PERMISSIONS.MEMBER_CREATE),
  upload.single("profileImage"),
  createUserController
);

router.put(
  "/admin/users/update-user/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.MEMBER_UPDATE),
  upload.single("profileImage"),
  updateUserController
);

router.post("/admin/users", adminController.createUserController);
router.patch("/admin/users/:id", adminController.updateUserController);
router.delete("/admin/users/:id", adminController.deleteUserController);

router.get("/admin/users/:id", adminController.getUserDetails);
router.get("/admin/events/:id", adminController.getEventDetails);
router.get("/admin/blogs/:id", adminController.getBlogDetails);
router.get("/admin/search", adminController.globalSearch);

export default router;
