import { Router } from "express";
import { authMiddleware, requireTontineRole } from "../../middleware/auth.js";
import { MembershipsController } from "./memberships.controller.js";
import { validate } from "../../middleware/validate.js";
import { z } from "zod";

const router = Router();
const controller = new MembershipsController();

const InviteMemberDto = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),
});

router.use(authMiddleware);

router.post("/:tontineId/members/invite", validate(InviteMemberDto), controller.inviteMember);
router.delete("/:tontineId/members/:memberId", requireTontineRole("tontineId", "ORGANIZER", "ADMIN"), controller.removeMember);

export default router;
