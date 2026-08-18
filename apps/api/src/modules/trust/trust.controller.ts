import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";

export class TrustController {
  async getMyTrustProfile(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;

      const profile = await getPrisma().trustProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return res.status(404).json({ error: "Trust profile not found" });
      }

      res.json({ profile });
    } catch (error) {
      next(error);
    }
  }

  async getTrustProfile(req: any, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const profile = await getPrisma().trustProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return res.status(404).json({ error: "Trust profile not found" });
      }

      res.json({ profile });
    } catch (error) {
      next(error);
    }
  }
}
