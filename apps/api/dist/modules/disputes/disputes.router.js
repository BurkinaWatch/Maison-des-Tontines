import { Router } from "express";
import { DisputesController } from "./disputes.controller.js";
import { validate } from "../../middleware/validate.js";
import { authMiddleware, requireRole } from "../../middleware/auth.js";
import { OpenDisputeDto, ResolveDisputeDto } from "./dto/disputes.dto.js";
const router = Router();
const controller = new DisputesController();
router.use(authMiddleware);
router.post("/", validate(OpenDisputeDto), controller.openDispute);
router.post("/:disputeId/resolve", requireRole("ADMIN", "ORGANIZER"), validate(ResolveDisputeDto), controller.resolveDispute);
router.get("/", controller.getDisputes);
export default router;
//# sourceMappingURL=disputes.router.js.map