import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";

export class DisputesController {
  async openDispute(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { tontineId, cycleId, contributionId, type, description } = req.body;

      const membership = await getPrisma().tontineMember.findFirst({
        where: { tontineId, userId, status: "ACTIVE" },
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a member of this tontine" });
      }

      if (cycleId) {
        const cycle = await getPrisma().tontineCycle.findFirst({
          where: { id: cycleId, tontineId },
          select: { id: true },
        });
        if (!cycle) {
          return res.status(404).json({ error: "Cycle not found in this tontine" });
        }
      }

      if (contributionId) {
        const contribution = await getPrisma().contribution.findFirst({
          where: {
            id: contributionId,
            cycle: { tontineId },
          },
          select: { id: true, cycleId: true },
        });
        if (!contribution) {
          return res.status(404).json({ error: "Contribution not found in this tontine" });
        }
        if (cycleId && contribution.cycleId !== cycleId) {
          return res.status(400).json({ error: "Contribution does not belong to the requested cycle" });
        }
      }

      const dispute = await getPrisma().dispute.create({
        data: {
          tontineId,
          cycleId,
          contributionId,
          type,
          description,
          status: "OPEN",
          openedById: userId,
        },
        include: {
          openedBy: { select: { id: true, phone: true, name: true } },
        },
      });

      logger.info("Dispute opened", { disputeId: dispute.id, tontineId, userId });
      res.status(201).json({ dispute });
    } catch (error) {
      next(error);
    }
  }

  async resolveDispute(req: any, res: Response, next: NextFunction) {
    try {
      const { disputeId } = req.params;
      const { decision } = req.body;
      const userId = req.userId!;

      const dispute = await getPrisma().dispute.findUnique({
        where: { id: disputeId },
      });

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found" });
      }

      const membership = await getPrisma().tontineMember.findFirst({
        where: {
          tontineId: dispute.tontineId,
          userId,
          status: "ACTIVE",
          role: { in: ["ADMIN", "ORGANIZER"] },
        },
      });
      if (!membership) {
        return res.status(403).json({ error: "Forbidden", message: "Organizer access required for this tontine" });
      }

      const updatedDispute = await getPrisma().dispute.update({
        where: { id: disputeId },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
          resolvedById: userId,
          decision,
        },
        include: {
          openedBy: { select: { id: true, phone: true, name: true } },
          resolvedBy: { select: { id: true, phone: true, name: true } },
        },
      });

      await getPrisma().trustProfile.updateMany({
        where: { userId: dispute.openedById },
        data: { disputesResolved: { increment: 1 } },
      });

      logger.info("Dispute resolved", { disputeId });
      res.json({ dispute: updatedDispute });
    } catch (error) {
      next(error);
    }
  }

  async getDisputes(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId, status } = req.query;

      if (typeof tontineId !== "string") {
        return res.status(400).json({ error: "tontineId is required" });
      }

      const membership = await getPrisma().tontineMember.findFirst({
        where: { tontineId, userId: req.userId!, status: "ACTIVE" },
        select: { id: true },
      });
      if (!membership) {
        return res.status(403).json({ error: "Not a member of this tontine" });
      }

      const where: any = { tontineId };
      if (status) where.status = status;

      const disputes = await getPrisma().dispute.findMany({
        where,
        include: {
          openedBy: { select: { id: true, phone: true, name: true } },
          resolvedBy: { select: { id: true, phone: true, name: true } },
        },
        orderBy: { openedAt: "desc" },
      });

      res.json({ disputes });
    } catch (error) {
      next(error);
    }
  }
}
