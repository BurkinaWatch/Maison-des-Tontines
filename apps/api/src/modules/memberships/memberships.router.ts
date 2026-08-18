import { Router } from "express";
import { authMiddleware, requireTontineRole } from "../../middleware/auth.js";
import { MembershipsController } from "./memberships.controller.js";
import { validate } from "../../middleware/validate.js";
import { InviteMemberDto } from "./dto/memberships.dto.js";

const router = Router();
const controller = new MembershipsController();

router.use(authMiddleware);

router.post("/:tontineId/members/invite", validate(InviteMemberDto), controller.inviteMember);
router.delete("/:tontineId/members/:memberId", requireTontineRole("tontineId", "ORGANIZER", "ADMIN"), controller.removeMember);

export default router;
