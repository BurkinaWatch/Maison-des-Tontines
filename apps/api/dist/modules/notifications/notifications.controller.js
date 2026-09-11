import { getPrisma } from "../../config/database.js";
export class NotificationsController {
    async getUnreadCount(req, res, next) {
        try {
            const count = await getPrisma().notification.count({ where: { userId: req.userId, status: { not: "READ" } } });
            res.json({ count });
        }
        catch (error) {
            next(error);
        }
    }
    async registerDeviceToken(req, res, next) {
        try {
            const { token, platform } = req.body;
            if (!token || !["ios", "android", "web"].includes(platform)) {
                return res.status(400).json({ error: "A valid device token and platform are required" });
            }
            const deviceToken = await getPrisma().deviceToken.upsert({
                where: { token },
                update: { userId: req.userId, platform, enabled: true },
                create: { userId: req.userId, token, platform },
            });
            res.json({ deviceToken: { id: deviceToken.id, platform: deviceToken.platform, enabled: deviceToken.enabled } });
        }
        catch (error) {
            next(error);
        }
    }
    async getNotifications(req, res, next) {
        try {
            const userId = req.userId;
            const { status, channel, limit = 50 } = req.query;
            const where = { userId };
            if (status)
                where.status = status;
            if (channel)
                where.channel = channel;
            const notifications = await getPrisma().notification.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: Number(limit),
            });
            res.json({ notifications });
        }
        catch (error) {
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const notification = await getPrisma().notification.findFirst({
                where: { id, userId },
            });
            if (!notification) {
                return res.status(404).json({ error: "Notification not found" });
            }
            const updated = await getPrisma().notification.update({
                where: { id },
                data: { status: "READ", readAt: new Date() },
            });
            res.json({ notification: updated });
        }
        catch (error) {
            next(error);
        }
    }
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.userId;
            await getPrisma().notification.updateMany({
                where: { userId, status: { not: "READ" } },
                data: { status: "READ", readAt: new Date() },
            });
            res.json({ message: "All notifications marked as read" });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=notifications.controller.js.map