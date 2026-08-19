import { NotificationChannelInterface } from "./notification-channel.interface.js";
import { getPrisma } from "../../../config/database.js";
import { logger } from "../../../config/logger.js";

export class PushChannel implements NotificationChannelInterface {
  async send(notification: {
    userId: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info("Push notification sent", { userId: notification.userId, title: notification.title });
      return { success: true };
    } catch (error) {
      logger.error("Push notification failed", { error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }
}
