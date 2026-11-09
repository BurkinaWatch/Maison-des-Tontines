import { NotificationChannelInterface } from "./notification-channel.interface.js";
import { logger } from "../../../config/logger.js";
import { getPrisma } from "../../../config/database.js";

type ExpoPushTicket = {
  status?: string;
  id?: string;
  message?: string;
  details?: { error?: string };
};

function getTickets(payload: unknown): ExpoPushTicket[] {
  if (typeof payload !== "object" || payload === null) return [];
  const data = (payload as { data?: unknown }).data;
  if (Array.isArray(data)) return data as ExpoPushTicket[];
  return data && typeof data === "object" ? [data as ExpoPushTicket] : [];
}

export class PushChannel implements NotificationChannelInterface {
  async send(notification: {
    userId: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const tokens = await getPrisma().deviceToken.findMany({
        where: { userId: notification.userId, enabled: true },
        select: { id: true, token: true },
      });
      if (!tokens.length) return { success: false, error: "No enabled device token" };
      let acceptedCount = 0;
      let failedCount = 0;

      for (let offset = 0; offset < tokens.length; offset += 100) {
        const batch = tokens.slice(offset, offset + 100);
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batch.map(({ token }) => ({
            to: token,
            title: notification.title,
            body: notification.body,
            data: notification.data ?? {},
          }))),
        });
        if (!response.ok) {
          failedCount += batch.length;
          logger.warn("Expo push request failed", {
            userId: notification.userId,
            status: response.status,
            tokenCount: batch.length,
          });
          continue;
        }

        const tickets = getTickets(await response.json().catch(() => null));
        for (const [index, device] of batch.entries()) {
          const ticket = tickets[index];
          if (ticket?.status === "ok") {
            acceptedCount += 1;
            continue;
          }

          failedCount += 1;
          const providerError = ticket?.details?.error;
          if (providerError === "DeviceNotRegistered") {
            try {
              await getPrisma().deviceToken.updateMany({
                where: { id: device.id, userId: notification.userId },
                data: { enabled: false },
              });
            } catch (error) {
              logger.error("Could not disable an unregistered Expo device", {
                deviceTokenId: device.id,
                error: (error as Error).message,
              });
            }
          }
          logger.warn("Expo push ticket failed", {
            userId: notification.userId,
            deviceTokenId: device.id,
            error: providerError ?? ticket?.message ?? "Missing or invalid Expo ticket",
          });
        }
      }

      if (acceptedCount > 0) {
        logger.info("Push notification accepted by Expo", {
          userId: notification.userId,
          acceptedCount,
          failedCount,
        });
      }
      return acceptedCount > 0
        ? { success: true }
        : { success: false, error: "Expo did not accept any device notification" };
    } catch (error) {
      logger.error("Push notification failed", { error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }
}
