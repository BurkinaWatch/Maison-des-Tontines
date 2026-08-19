import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";

export class AIController {
  async chat(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { tontineId, message } = req.body;

      const conversation = await getPrisma().aIConversation.create({
        data: {
          userId,
          tontineId,
          messages: JSON.stringify([{ role: "user", content: message }]),
        },
      });

      // AI response simulation
      const aiResponse = {
        role: "assistant",
        content: `This is an AI simulation. In production, this would connect to ${process.env.AI_PROVIDER || "an AI service"}. You asked: "${message}"`,
      };

      const messages = JSON.parse(conversation.messages);
      messages.push(aiResponse);

      const updatedConversation = await getPrisma().aIConversation.update({
        where: { id: conversation.id },
        data: { messages: JSON.stringify(messages) },
      });

      res.status(200).json({ conversation: updatedConversation });
    } catch (error) {
      next(error);
    }
  }

  async getInsights(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId } = req.params;

      const insights = await getPrisma().aIInsight.findMany({
        where: { tontineId },
        orderBy: { createdAt: "desc" },
      });

      res.json({ insights });
    } catch (error) {
      next(error);
    }
  }
}
