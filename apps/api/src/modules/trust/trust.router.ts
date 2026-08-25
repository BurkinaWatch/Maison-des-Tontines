import { Router } from "express";
import { TrustController } from "./trust.controller.js";
import { authMiddleware, requireRole } from "../../middleware/auth.js";

const router = Router();
const controller = new TrustController();

router.use(authMiddleware);

router.get("/me", controller.getMyTrustProfile);
router.get("/:userId", (req: any, res: any, next: any) => {
  if (req.userId === req.params.userId || ["ADMIN", "SUPERVISOR"].includes(req.user?.role)) return controller.getTrustProfile(req, res, next);
  return res.status(403).json({ error: "Forbidden" });
});

export default router;
