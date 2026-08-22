import { getPrisma } from "../../../config/database.js";
import { logger } from "../../../config/logger.js";
export class SMSChannel {
    async send(notification) {
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
        }
        catch (error) {
            logger.error("SMS notification failed", { error: error.message });
            return { success: false, error: error.message };
        }
    }
}
//# sourceMappingURL=sms.channel.js.map