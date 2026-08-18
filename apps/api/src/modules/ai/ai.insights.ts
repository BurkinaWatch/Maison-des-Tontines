import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";

export class AIService {
  async generateInsight(tontineId: string) {
    const tontine = await getPrisma().tontine.findUnique({
      where: { id: tontineId },
      include: { cycles: true, members: true },
    });

    if (!tontine) {
      throw new Error("Tontine not found");
    }

    const insights = [];

    const activeCycles = tontine.cycles.filter((c) => c.status === "OPEN" || c.status === "FUNDED");
    if (activeCycles.length > 0) {
      const cycle = activeCycles[0];
      const contributionRate = cycle.potReceived
        ? (Number(cycle.potReceived) / Number(cycle.potAmount || 1)) * 100
        : 0;

      if (contributionRate < 70) {
        insights.push({
          type: "LOW_CONTRIBUTION",
          priority: "HIGH",
          data: {
            message: `Contribution rate is ${contributionRate.toFixed(1)}% for ${cycle.name}`,
            contributionRate,
            potReceived: cycle.potReceived,
            potAmount: cycle.potAmount,
          },
        });
      }
    }

    for (const insight of insights) {
      await getPrisma().aIInsight.create({
        data: {
          tontineId,
          type: insight.type,
          data: JSON.stringify(insight.data),
          priority: insight.priority,
        },
      });
    }

    return insights;
  }
}

export const aiService = new AIService();
