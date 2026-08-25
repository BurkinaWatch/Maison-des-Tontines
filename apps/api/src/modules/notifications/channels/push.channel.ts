import { NotificationChannelInterface } from "./notification-channel.interface.js";
import { logger } from "../../../config/logger.js";

export class PushChannel implements NotificationChannelInterface {
  async send(notification: {
    userId: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const tokens = await (await import("../../../config/database.js")).getPrisma().deviceToken.findMany({
        where: { userId: notification.userId, enabled: true },
        select: { id: true, token: true },
      });
      if (!tokens.length) return { success: false, error: "No enabled device token" };
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokens.map(({ token }) => ({
          to: token, title: notification.title, body: notification.body, data: notification.data ?? {},
        }))),
      });
      if (!response.ok) return { success: false, error: `Push provider returned ${response.status}` };
      logger.info("Push notification sent", { userId: notification.userId, tokenCount: tokens.length });
      return { success: true };
    } catch (error) {
      logger.error("Push notification failed", { error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }
}
