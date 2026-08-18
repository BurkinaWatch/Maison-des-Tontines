import { Router } from "express";
import { WebhookController } from "./webhook.controller.js";

const router = Router();
const controller = new WebhookController();

router.post("/wave", (req: any, res: any, next: any) => controller.handleWaveWebhook(req, res, next));

export default router;
