import { Router } from "express";
import { TrustController } from "./trust.controller.js";
import { authMiddleware } from "../../middleware/auth.js";
const router = Router();
const controller = new TrustController();
router.use(authMiddleware);
router.get("/me", controller.getMyTrustProfile);
router.get("/:userId", controller.getTrustProfile);
export default router;
//# sourceMappingURL=trust.router.js.map