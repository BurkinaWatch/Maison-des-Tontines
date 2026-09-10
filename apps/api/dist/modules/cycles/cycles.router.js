import { Router } from "express";
import { authMiddleware, requireCycleInTontine, requireTontineMembership, requireTontineRole, } from "../../middleware/auth.js";
import { CyclesController } from "./cycles.controller.js";
const router = Router();
const controller = new CyclesController();
router.use(authMiddleware);
router.get("/:tontineId/cycles", requireTontineMembership("tontineId"), controller.getTontineCycles);
router.get("/:tontineId/cycles/:cycleId", requireCycleInTontine(), controller.getCycle);
router.post("/:tontineId/cycles/:cycleId/advance", requireTontineRole("tontineId", "ORGANIZER", "ADMIN"), requireCycleInTontine(), controller.advanceCycle);
router.post("/:tontineId/cycles/:cycleId/complete", requireTontineRole("tontineId", "ORGANIZER", "ADMIN"), requireCycleInTontine(), controller.completeCycle);
export default router;
//# sourceMappingURL=cycles.router.js.map