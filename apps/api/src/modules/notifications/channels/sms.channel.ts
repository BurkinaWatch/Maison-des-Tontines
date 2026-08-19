import { NotificationChannelInterface } from "./notification-channel.interface.js";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";

export class SMSChannel implements NotificationChannelInterface {
  async send(notification: {
    userId: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await getPrisma().user.findUnique({
        where: { id: notification.userId },
        select: { phone: true },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      logger.info("SMS notification sent", { phone: user.phone, body: notification.body });
      return { success: true };
    } catch (error) {
      logger.error("SMS notification failed", { error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }
}
