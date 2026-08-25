import { Router } from "express";
import { authMiddleware, requireTontineRole } from "../../middleware/auth.js";
import { CyclesController } from "./cycles.controller.js";

const router = Router();
const controller = new CyclesController();

router.use(authMiddleware);

router.get("/:tontineId/cycles", requireTontineRole("tontineId", "ORGANIZER", "ADMIN", "TREASURER", "MEMBER"), controller.getTontineCycles);
router.get("/:tontineId/cycles/:cycleId", requireTontineRole("tontineId", "ORGANIZER", "ADMIN", "TREASURER", "MEMBER"), controller.getCycle);
router.post("/:tontineId/cycles/:cycleId/advance", requireTontineRole("tontineId", "ORGANIZER", "ADMIN"), controller.advanceCycle);
router.post("/:tontineId/cycles/:cycleId/complete", requireTontineRole("tontineId", "ORGANIZER", "ADMIN"), controller.completeCycle);

export default router;
