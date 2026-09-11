import { Router } from "express";
import authRoutes from "./modules/auth/auth.router.js";
import usersRoutes from "./modules/users/users.router.js";
import tontinesRoutes from "./modules/tontines/tontines.router.js";
import membershipsRoutes from "./modules/memberships/memberships.router.js";
import cyclesRoutes from "./modules/cycles/cycles.router.js";
import contributionsRoutes from "./modules/contributions/contributions.router.js";
import paymentsRoutes from "./modules/payments/payments.router.js";
import webhooksRoutes from "./modules/payments/webhooks/webhook.router.js";
import votingRoutes from "./modules/voting/voting.router.js";
import disputesRoutes from "./modules/disputes/disputes.router.js";
import notificationsRoutes from "./modules/notifications/notifications.router.js";
import trustRoutes from "./modules/trust/trust.router.js";
import aiRoutes from "./modules/ai/ai.router.js";
import auditRoutes from "./modules/audit/audit.router.js";
import adminRoutes from "./modules/admin/admin.router.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/tontines", tontinesRoutes);
router.use("/memberships", membershipsRoutes);
router.use("/cycles", cyclesRoutes);
router.use("/contributions", contributionsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/webhooks", webhooksRoutes);
router.use("/voting", votingRoutes);
router.use("/disputes", disputesRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/trust", trustRoutes);
router.use("/ai", aiRoutes);
router.use("/audit", auditRoutes);
router.use("/admin", adminRoutes);

export default router;
