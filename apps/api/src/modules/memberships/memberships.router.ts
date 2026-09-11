import { Router } from "express";
import { authMiddleware, requireTontineRole } from "../../middleware/auth.js";
import { MembershipsController } from "./memberships.controller.js";
import { validate } from "../../middleware/validate.js";
import { z } from "zod";

const router = Router();
const controller = new MembershipsController();

const InviteMemberDto = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format").optional(),
  email: z.string().email("Invalid email address").optional(),
}).refine((data) => data.phone || data.email, {
  message: "A phone number or email address is required",
});

router.use(authMiddleware);

router.post("/:tontineId/members/invite", requireTontineRole("tontineId", "ORGANIZER", "ADMIN"), validate(InviteMemberDto), controller.inviteMember);
router.get("/invitations", controller.getMyInvitations);
router.patch("/invitations/:membershipId", validate(z.object({ decision: z.enum(["ACCEPT", "DECLINE"]) })), controller.respondToInvitation);
router.patch("/:tontineId/members/:memberId", requireTontineRole("tontineId", "ORGANIZER", "ADMIN"), validate(z.object({ role: z.enum(["MEMBER", "TREASURER", "ADMIN"]) })), controller.updateMember);
router.delete("/:tontineId/members/:memberId", requireTontineRole("tontineId", "ORGANIZER", "ADMIN"), controller.removeMember);

export default router;
