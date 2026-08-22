import { Router } from "express";
import { AIController } from "./ai.controller.js";
import { validate } from "../../middleware/validate.js";
import { authMiddleware } from "../../middleware/auth.js";
import { z } from "zod";
const router = Router();
const controller = new AIController();
router.use(authMiddleware);
const ChatDto = z.object({
    tontineId: z.string().optional(),
    message: z.string().min(1, "Message is required"),
});
router.post("/chat", validate(ChatDto), controller.chat);
router.get("/insights/:tontineId", controller.getInsights);
export default router;
//# sourceMappingURL=ai.router.js.map