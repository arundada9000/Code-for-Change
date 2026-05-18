import express from "express";
import { subscribeToPush, unsubscribeFromPush, updatePushPreferences, adminSendPush } from "./notification.controller.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../shared/middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/configs/permissions.js";

const router = express.Router();

router.use(authenticate); // All notification endpoints require auth

router.post("/subscribe", subscribeToPush);
router.post("/unsubscribe", unsubscribeFromPush);
router.put("/preferences", updatePushPreferences);

// Admin only endpoints
router.post("/admin/send", requireAnyPermission(PERMISSIONS.SETTINGS_MANAGE), adminSendPush);

export default router;
