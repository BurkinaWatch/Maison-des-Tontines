import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";

export class NotificationsController {
  async getNotifications(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { status, channel, limit = 50 } = req.query;

      const where: any = { userId };
      if (status) where.status = status;
      if (channel) where.channel = channel;

      const notifications = await getPrisma().notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Number(limit),
      });

      res.json({ notifications });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
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
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;

      await getPrisma().notification.updateMany({
        where: { userId, status: { not: "READ" } },
        data: { status: "READ", readAt: new Date() },
      });

      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  }
}
