import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import { notifyUser } from "../notifications/notification.service.js";

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
      const recipients = await getPrisma().tontineMember.findMany({
        where: { tontineId, status: "ACTIVE", userId: { not: userId } },
        select: { userId: true },
      });
      void Promise.all(recipients.map((recipient) =>
        notifyUser({ userId: recipient.userId, type: "DISPUTE", title: "New dispute", body: description, data: { disputeId: dispute.id, category: "disputes" } })
          .catch((error) => logger.warn("Dispute notification failed", { error: (error as Error).message })),
      ));
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

      const where: any = {};
      if (tontineId) where.tontineId = tontineId;
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
