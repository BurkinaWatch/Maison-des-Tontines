import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";

export class WebhookService {
  async handleWaveWebhook(payload: any, signature: string) {
    logger.info("Wave webhook received", { event: payload.event });

    if (payload.event === "payment.completed") {
      const contribution = await getPrisma().contribution.findFirst({
        where: { providerRef: payload.id },
        include: { cycle: true },
      });

      if (contribution && contribution.status === "PROCESSING") {
        await getPrisma().contribution.update({
          where: { id: contribution.id },
          data: { status: "PAID", confirmedAt: new Date() },
        });

        const tontine = await getPrisma().tontine.findUnique({
          where: { id: contribution.cycle.tontineId },
        });

        if (tontine) {
          const totalPaid = await getPrisma().contribution.aggregate({
            where: { cycleId: contribution.cycleId, status: { in: ["PAID", "LATE"] } },
            _sum: { amount: true },
          });

          const memberCount = await getPrisma().tontineMember.count({
            where: { tontineId: contribution.cycle.tontineId, status: "ACTIVE" },
          });

          const requiredAmount = Number(tontine.contributionAmount) * memberCount;
          const newStatus = Number(totalPaid._sum.amount || 0) >= requiredAmount ? "FUNDED" : "PARTIALLY_FUNDED";

          await getPrisma().tontineCycle.update({
            where: { id: contribution.cycleId },
            data: { status: newStatus, potReceived: totalPaid._sum.amount || 0 },
          });
        }
      }
    }

    return true;
  }
}

export const webhookService = new WebhookService();
