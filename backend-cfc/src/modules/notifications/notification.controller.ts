import { Request, Response } from "express";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";
import { NotificationService } from "./notification.service.js";
import { UserTable } from "../user/user.model.js";

export const subscribeToPush = async (req: Request, res: Response) => {
  try {
    const { subscription } = req.body;
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: "Invalid subscription object" });
    }

    // Add subscription to user if not exists
    const user = await UserTable.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const exists = user.pushSubscriptions?.some(sub => sub.endpoint === subscription.endpoint);
    
    if (!exists) {
      user.pushSubscriptions = user.pushSubscriptions || [];
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    // Send a welcome notification
    await NotificationService.sendNotificationToUser(userId, {
      title: "Notifications Enabled!",
      body: "You'll now receive updates from Code for Change Nepal.",
      url: "/profile",
      icon: "/icons/icons/icon-192x192.png"
    });

    res.status(200).json({ success: true, message: "Subscribed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unsubscribeFromPush = async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await UserTable.updateOne(
      { _id: userId },
      { $pull: { pushSubscriptions: { endpoint } } }
    );

    res.status(200).json({ success: true, message: "Unsubscribed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePushPreferences = async (req: Request, res: Response) => {
  try {
    const { preferences } = req.body;
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await UserTable.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.notificationPreferences = { ...user.notificationPreferences, ...preferences };
    await user.save();

    res.status(200).json({ success: true, message: "Preferences updated", data: user.notificationPreferences });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminSendPush = async (req: Request, res: Response) => {
  try {
    const { title, body, url, targetRoles, targetProvince, targetAll } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: "Title and body are required" });
    }

    const payload = { title, body, url: url || "/", icon: "/icons/icons/icon-192x192.png" };

    let result = { successCount: 0, failCount: 0 };

    if (targetAll) {
      result = await NotificationService.sendToAll(payload);
    } else {
      const query: any = {};
      
      if (targetRoles && targetRoles.length > 0) {
        query.role = { $in: targetRoles };
      }
      
      if (targetProvince) {
        query.province = targetProvince;
      }

      if (Object.keys(query).length === 0) {
        return res.status(400).json({ success: false, message: "Please specify target audience" });
      }

      result = await NotificationService.sendToQuery(query, payload);
    }

    res.status(200).json({ 
      success: true, 
      message: `Notification sent. Success: ${result.successCount}, Failed: ${result.failCount}` 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
