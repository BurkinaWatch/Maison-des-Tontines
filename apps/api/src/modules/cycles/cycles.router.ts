import { Router } from "express";
import { CyclesController } from "./cycles.controller.js";
import { authMiddleware, requireTontineRole } from "../../middleware/auth.js";

const router = Router();
const controller = new CyclesController();

router.use(authMiddleware);

router.get("/:tontineId/cycles", controller.getTontineCycles);
router.get("/:tontineId/cycles/:cycleId", controller.getCycle);
router.post("/:tontineId/cycles/:cycleId/advance", requireTontineRole("tontineId", "ORGANIZER", "ADMIN"), controller.advanceCycle);
router.post("/:tontineId/cycles/:cycleId/complete", requireTontineRole("tontineId", "ORGANIZER", "ADMIN"), controller.completeCycle);

export default router;
