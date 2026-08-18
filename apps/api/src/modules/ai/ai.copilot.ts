import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";

export class AICopilotService {
  async generateResponse(userId: string, tontineId: string | null, message: string): Promise<string> {
    const tontineContext = tontineId
      ? await getPrisma().tontine.findUnique({
          where: { id: tontineId },
          include: { cycles: { orderBy: { sequence: "desc" }, take: 3 }, members: true },
        })
      : null;

    if (tontineContext) {
      const activeCycle = tontineContext.cycles.find((c) => c.status === "OPEN" || c.status === "FUNDED");
      if (activeCycle) {
        return `For ${tontineContext.name}, the current cycle is "${activeCycle.name}" with status ${activeCycle.status}. The pot is ${activeCycle.potAmount || 0}.`;
      }
    }

    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("contribution") || lowerMessage.includes("pay")) {
      return "Contributions should be made before the cycle end date. Late payments may incur penalties. Please check your active cycles.";
    }
    if (lowerMessage.includes("payout") || lowerMessage.includes("beneficiary")) {
      return "Payouts are processed automatically at the end of each cycle. The beneficiary is selected based on the rotation rules.";
    }
    if (lowerMessage.includes("help")) {
      return "I can help you with tontine management, contributions, payouts, and disputes. What would you like to know?";
    }

    return "I'm here to help with your tontine activities. You can ask about contributions, payouts, members, or disputes.";
  }
}

export const aiCopilotService = new AICopilotService();
