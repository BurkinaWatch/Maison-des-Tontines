import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { NotificationsController } from "./notifications.controller.js";
const router = Router();
const controller = new NotificationsController();
router.use(authMiddleware);
router.get("/", controller.getNotifications);
router.patch("/:id/read", controller.markAsRead);
router.patch("/mark-all-read", controller.markAllAsRead);
export default router;
//# sourceMappingURL=notifications.router.js.map