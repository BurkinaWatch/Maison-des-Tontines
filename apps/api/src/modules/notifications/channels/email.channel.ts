import { NotificationChannelInterface } from "./notification-channel.interface.js";
import { getPrisma } from "../../../config/database.js";
import { logger } from "../../../config/logger.js";

export class EmailChannel implements NotificationChannelInterface {
  async send(notification: {
    userId: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await getPrisma().user.findUnique({
        where: { id: notification.userId },
        select: { email: true },
      });

      if (!user?.email) {
        return { success: false, error: "User email not found" };
      }

      logger.info("Email notification sent", { email: user.email, title: notification.title });
      return { success: true };
    } catch (error) {
      logger.error("Email notification failed", { error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }
}
