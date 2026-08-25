import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { authMiddleware, requireRole, optionalAuth } from "../../middleware/auth.js";
import { NotificationsController } from "./notifications.controller.js";
import { z } from "zod";

const router = Router();
const controller = new NotificationsController();

router.use(authMiddleware);

router.get("/", controller.getNotifications);
router.get("/unread-count", controller.getUnreadCount);
router.post("/device-token", validate(z.object({ token: z.string().min(10), platform: z.enum(["ios", "android", "web"]) })), controller.registerDeviceToken);
router.post("/:id/read", controller.markAsRead);
router.post("/read-all", controller.markAllAsRead);

export default router;
