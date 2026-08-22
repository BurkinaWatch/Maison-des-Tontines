import { Router } from "express";
import { WebhookController } from "./webhook.controller.js";
const router = Router();
const controller = new WebhookController();
router.post("/wave", (req, res, next) => controller.handleWaveWebhook(req, res, next));
export default router;
//# sourceMappingURL=webhook.router.js.map