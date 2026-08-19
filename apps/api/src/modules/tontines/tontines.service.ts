import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import { TontineEngine } from "./tontine-engine/engine.service.js";

const TontineStatus = {
  DRAFT: "DRAFT",
  INVITING: "INVITING",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  DISPUTED: "DISPUTED",
} as const;

export class TontinesService {
  constructor(private engine: TontineEngine) {}

  async createTontine(data: any, userId: string) {
    return getPrisma().tontine.create({
      data: {
        ...data,
        createdById: userId,
        rules: data.rules
          ? Object.entries(data.rules).map(([key, value]) => ({
              key,
              value: String(value),
              type: typeof value === "number" ? "NUMBER" : "STRING",
            }))
          : [],
      },
      include: { rules: true },
    });
  }

  async getTontines(userId: string, filters: any) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    return getPrisma().tontine.findMany({
      where,
      include: {
        members: { where: { userId, status: "ACTIVE" } },
        cycles: { orderBy: { sequence: "desc" }, take: 1 },
        _count: { select: { members: true } },
      },
      skip: (Number(filters.page || 1) - 1) * Number(filters.limit || 20),
      take: Number(filters.limit || 20),
      orderBy: { createdAt: "desc" },
    });
  }

  async getTontineById(id: string, userId: string) {
    return getPrisma().tontine.findFirst({
      where: { id, members: { some: { userId, status: "ACTIVE" } } },
      include: {
        rules: true,
        members: {
          include: { user: { select: { id: true, phone: true, email: true, name: true } } },
          orderBy: { payoutOrder: "asc" },
        },
        cycles: { orderBy: { sequence: "asc" } },
        votes: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
  }

  async updateTontine(id: string, data: any) {
    return getPrisma().tontine.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: { rules: true },
    });
  }

  async addMember(tontineId: string, userId: string, role: string = "MEMBER") {
    const membership = await getPrisma().tontineMember.create({
      data: {
        tontineId,
        userId,
        role,
        status: "ACTIVE",
      },
    });

    await getPrisma().tontine.update({
      where: { id: tontineId },
      data: { status: TontineStatus.INVITING },
    });

    return membership;
  }
}

export const tontinesService = new TontinesService(new TontineEngine());
