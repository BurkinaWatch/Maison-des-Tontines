import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";

export class CyclesController {
  async getTontineCycles(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId } = req.params;

      const cycles = await getPrisma().tontineCycle.findMany({
        where: { tontineId },
        include: {
          beneficiary: { include: { user: { select: { id: true, phone: true, name: true } } } },
          contributions: { include: { member: { include: { user: { select: { id: true, phone: true, name: true } } } } } },
          payouts: { include: { member: { include: { user: { select: { id: true, phone: true, name: true } } } } } },
        },
        orderBy: { sequence: "asc" },
      });

      res.json({ cycles });
    } catch (error) {
      next(error);
    }
  }

  async getCycle(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId, cycleId } = req.params;

      const cycle = await getPrisma().tontineCycle.findFirst({
        where: { id: cycleId, tontineId },
        include: {
          beneficiary: { include: { user: { select: { id: true, phone: true, name: true } } } },
          contributions: { include: { member: { include: { user: { select: { id: true, phone: true, name: true } } } } } },
          payouts: { include: { member: { include: { user: { select: { id: true, phone: true, name: true } } } } } },
        },
      });

      if (!cycle) {
        return res.status(404).json({ error: "Cycle not found" });
      }

      res.json({ cycle });
    } catch (error) {
      next(error);
    }
  }

  async advanceCycle(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId, cycleId } = req.params;
      const result = await tontineEngineModule.getCycleService().advanceCycle(tontineId, cycleId);
      res.json({ cycle: result });
    } catch (error) {
      next(error);
    }
  }

  async completeCycle(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId, cycleId } = req.params;
      const result = await tontineEngineModule.getCycleService().completeCycle(tontineId, cycleId);
      res.json({ cycle: result });
    } catch (error) {
      next(error);
    }
  }
}
