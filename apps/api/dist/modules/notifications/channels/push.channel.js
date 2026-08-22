import { logger } from "../../../config/logger.js";
export class PushChannel {
    async send(notification) {
        try {
            logger.info("Push notification sent", { userId: notification.userId, title: notification.title });
            return { success: true };
        }
        catch (error) {
            logger.error("Push notification failed", { error: error.message });
            return { success: false, error: error.message };
        }
    }
}
//# sourceMappingURL=push.channel.js.map