import { Router } from "express";
import { PERMISSIONS } from "../../shared/configs/permissions.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { upload, validateFileMagicBytes } from "../../shared/middlewares/multer.js";
import { addUserPermission, createUserController, deleteUserController, getPublicUsersController, getUsersController, removeUserPermission, updateUserController } from "./user.controller.js";

const router = Router();

router.get("/public-users", getPublicUsersController);

router.post(
  "/create-user",
  authenticate,
  requireAnyPermission(PERMISSIONS.MEMBER_CREATE),
  createUserController
);

router.get(
  "/list-user",
  authenticate,
  requireAnyPermission(PERMISSIONS.MEMBER_VIEW),
  getUsersController
);

router.put(
  "/update-user/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.MEMBER_UPDATE),
  upload.single("profileImage"),
  validateFileMagicBytes,
  updateUserController
);

router.delete(
  "/delete-user/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.MEMBER_DELETE),
  deleteUserController
);

router.put(
  "/update-permissions/:userId/add",
  authenticate,
  requireAnyPermission(PERMISSIONS.SETTINGS_MANAGE),
  addUserPermission
);

router.put(
  "/update-permissions/:userId/remove",
  authenticate,
  requireAnyPermission(PERMISSIONS.SETTINGS_MANAGE),
  removeUserPermission
);

export { router as userRoutes };
