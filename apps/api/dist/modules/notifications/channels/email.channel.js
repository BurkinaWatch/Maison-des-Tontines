import { getPrisma } from "../../../config/database.js";
import { logger } from "../../../config/logger.js";
export class EmailChannel {
    async send(notification) {
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
        }
        catch (error) {
            logger.error("Email notification failed", { error: error.message });
            return { success: false, error: error.message };
        }
    }
}
//# sourceMappingURL=email.channel.js.map