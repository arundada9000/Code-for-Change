import webpush from "web-push";
import { ENV } from "../../shared/configs/env.js";
import { UserTable } from "../user/user.model.js";

// Initialize web-push with VAPID keys
// We'll set this up to not crash if keys are missing initially, but warn
if (ENV.VAPID_PUBLIC_KEY && ENV.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:contact@codeforchangenepal.com",
    ENV.VAPID_PUBLIC_KEY,
    ENV.VAPID_PRIVATE_KEY
  );
} else {
  console.warn("⚠️ VAPID keys are missing from environment variables. Push notifications will not work.");
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  data?: any;
}

export class NotificationService {
  /**
   * Send a push notification to a specific user
   */
  static async sendNotificationToUser(userId: string, payload: PushPayload) {
    try {
      const user = await UserTable.findById(userId);
      if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
        return { success: false, message: "No active subscriptions for user" };
      }

      const stringifiedPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || "/icons/icons/icon-192x192.png",
        data: {
          url: payload.url || "/",
          ...payload.data
        }
      });

      const promises = user.pushSubscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, stringifiedPayload);
          return { success: true };
        } catch (error: any) {
          // If subscription is invalid/expired (410), remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await UserTable.updateOne(
              { _id: userId },
              { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
            );
          }
          return { success: false, error };
        }
      });

      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error("Error sending push notification to user:", error);
      return { success: false, error };
    }
  }

  /**
   * Send push notification to users matching a MongoDB query
   */
  static async sendToQuery(query: any, payload: PushPayload) {
    try {
      // Only get users who have at least one push subscription
      const users = await UserTable.find({ 
        ...query, 
        "pushSubscriptions.0": { $exists: true } 
      });

      let successCount = 0;
      let failCount = 0;

      for (const user of users) {
        const result = await this.sendNotificationToUser(user._id.toString(), payload);
        if (result.success) successCount++;
        else failCount++;
      }

      return { successCount, failCount };
    } catch (error) {
      console.error("Error in sendToQuery:", error);
      throw error;
    }
  }

  /**
   * Send to all users
   */
  static async sendToAll(payload: PushPayload) {
    return this.sendToQuery({}, payload);
  }
}
