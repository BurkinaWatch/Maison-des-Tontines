import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import { tontineEngineModule } from "../tontines/tontine-engine/module.js";

export class MembershipsController {
  async inviteMember(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId } = req.params;
      const { phone, email } = req.body;
      const userId = req.userId!;

      const normalizedPhone = phone?.replace(/[\s\-()]/g, "").replace(/^00/, "+");
      if (normalizedPhone && !/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
        return res.status(400).json({ error: "Invalid phone number" });
      }

      const tontine = await getPrisma().tontine.findUnique({
        where: { id: tontineId },
      });

      if (!tontine) {
        return res.status(404).json({ error: "Tontine not found" });
      }

      const memberCount = await getPrisma().tontineMember.count({
        where: { tontineId, status: "ACTIVE" },
      });

      if (tontine.maxMembers && memberCount >= tontine.maxMembers) {
        return res.status(400).json({ error: "Tontine is full" });
      }

      let user = await getPrisma().user.findFirst({
        where: normalizedPhone ? { phone: normalizedPhone } : { email: email.toLowerCase() },
      });

      if (!user) {
        return res.status(404).json({ error: "No account found for this phone number or email" });
      }

      const existingMembership = await getPrisma().tontineMember.findFirst({
        where: { tontineId, userId: user.id },
      });

      if (existingMembership) {
        return res.status(400).json({ error: "User is already a member" });
      }

      const maxOrder = await getPrisma().tontineMember.findFirst({
        where: { tontineId },
        orderBy: { payoutOrder: "desc" },
        select: { payoutOrder: true },
      });

      const membership = await getPrisma().tontineMember.create({
        data: {
          tontineId,
          userId: user.id,
          role: "MEMBER",
          status: "INVITED",
          payoutOrder: (maxOrder?.payoutOrder || 0) + 1,
        },
        include: { user: { select: { id: true, phone: true, name: true } } },
      });

      logger.info("Member invited", { tontineId, userId: user.id });
      res.status(201).json({ membership });
    } catch (error) {
      next(error);
    }
  }

  async getMyInvitations(req: any, res: Response, next: NextFunction) {
    try {
      const invitations = await getPrisma().tontineMember.findMany({
        where: { userId: req.userId, status: "INVITED" },
        include: { tontine: { select: { id: true, name: true, currency: true, contributionAmount: true } } },
        orderBy: { joinedAt: "desc" },
      });
      res.json({ invitations });
    } catch (error) { next(error); }
  }

  async respondToInvitation(req: any, res: Response, next: NextFunction) {
    try {
      const { membershipId } = req.params;
      const membership = await getPrisma().tontineMember.findFirst({
        where: { id: membershipId, userId: req.userId, status: "INVITED" },
        include: { tontine: true },
      });
      if (!membership) return res.status(404).json({ error: "Invitation not found" });
      const accepted = req.body.decision === "ACCEPT";
      const updated = await getPrisma().tontineMember.update({
        where: { id: membershipId },
        data: { status: accepted ? "ACTIVE" : "DECLINED", joinedAt: accepted ? new Date() : membership.joinedAt },
      });
      if (accepted) {
        await tontineEngineModule.getCycleService().createCycles(
          membership.tontineId, membership.tontine.frequency, membership.tontine.startDate,
          await getPrisma().tontineMember.count({ where: { tontineId: membership.tontineId, status: "ACTIVE" } }),
        );
      }
      res.json({ membership: updated });
    } catch (error) { next(error); }
  }

  async updateMember(req: any, res: Response, next: NextFunction) {
    try {
      const membership = await getPrisma().tontineMember.findFirst({ where: { id: req.params.memberId, tontineId: req.params.tontineId } });
      if (!membership) return res.status(404).json({ error: "Member not found" });
      if (membership.role === "ORGANIZER" && req.body.role !== "ORGANIZER") {
        return res.status(400).json({ error: "The organizer role cannot be removed" });
      }
      const updated = await getPrisma().tontineMember.update({ where: { id: membership.id }, data: { role: req.body.role } });
      res.json({ membership: updated });
    } catch (error) { next(error); }
  }

  async removeMember(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId, memberId } = req.params;

      const membership = await getPrisma().tontineMember.findFirst({ where: { id: memberId, tontineId } });
      if (!membership) return res.status(404).json({ error: "Member not found" });
      if (membership.role === "ORGANIZER") return res.status(400).json({ error: "The organizer cannot be removed" });
      await getPrisma().tontineMember.update({
        where: { id: memberId },
        data: { status: "INACTIVE", leftAt: new Date() },
      });

      logger.info("Member removed", { tontineId, memberId });
      res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
      next(error);
    }
  }
}
