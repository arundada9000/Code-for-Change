import { Router } from "express";
import { AdminController } from "./admin.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { upload } from "../../shared/middlewares/multer.js";
import { createUserController, updateUserController } from "../user/user.controller.js";

const router = Router();
const adminController = new AdminController();

// Dashboard & Content (read-only, but still require authentication)
router.get("/admin/dashboard", authenticate, requireAnyPermission(PERMISSIONS.MEMBER_VIEW), adminController.getDashboardStats);
router.get("/admin/content", authenticate, requireAnyPermission(PERMISSIONS.MEMBER_VIEW), adminController.getAllContent);

// User & Member Management (with file upload support)
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

// User CRUD via AdminController (previously unprotected!)
router.post("/admin/users", authenticate, requireAnyPermission(PERMISSIONS.MEMBER_CREATE), adminController.createUserController);
router.patch("/admin/users/:id", authenticate, requireAnyPermission(PERMISSIONS.MEMBER_UPDATE), adminController.updateUserController);
router.delete("/admin/users/:id", authenticate, requireAnyPermission(PERMISSIONS.MEMBER_DELETE), adminController.deleteUserController);

// Detail views & search (read-only, require auth + view permission)
router.get("/admin/users/:id", authenticate, requireAnyPermission(PERMISSIONS.MEMBER_VIEW), adminController.getUserDetails);
router.get("/admin/events/:id", authenticate, requireAnyPermission(PERMISSIONS.EVENT_VIEW), adminController.getEventDetails);
router.get("/admin/blogs/:id", authenticate, requireAnyPermission(PERMISSIONS.BLOG_VIEW), adminController.getBlogDetails);
router.get("/admin/search", authenticate, requireAnyPermission(PERMISSIONS.MEMBER_VIEW), adminController.globalSearch);

export default router;
