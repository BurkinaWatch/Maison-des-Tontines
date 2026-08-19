import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";

export class CyclesService {
  async getTontineCycles(tontineId: string) {
    return getPrisma().tontineCycle.findMany({
      where: { tontineId },
      include: {
        beneficiary: { include: { user: { select: { id: true, phone: true, name: true } } } },
        contributions: { include: { member: { include: { user: { select: { id: true, phone: true, name: true } } } } } },
        payouts: { include: { member: { include: { user: { select: { id: true, phone: true, name: true } } } } } },
      },
      orderBy: { sequence: "asc" },
    });
  }
}

export const cyclesService = new CyclesService();
