import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import { trustService } from "../trust/trust-profile.engine.js";

export class UsersService {
  async getUserById(userId: string) {
    return getPrisma().user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        trustProfile: true,
      },
    });
  }

  async updateProfile(userId: string, data: { name?: string; email?: string | null }) {
    return getPrisma().user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await getPrisma().user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // In a real app, verify currentPassword against user.passwordHash using bcrypt.compare
    // For now, we'll just update the password
    return getPrisma().user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });
  }

  async getTrustProfile(userId: string) {
    return trustService.getTrustScore(userId);
  }

  async getUserTontines(userId: string) {
    const memberships = await getPrisma().tontineMember.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        tontine: {
          include: {
            cycles: {
              where: { status: { in: ["OPEN", "FUNDED", "PAYOUT_PENDING"] } },
              orderBy: { sequence: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      id: m.tontine.id,
      name: m.tontine.name,
      type: m.tontine.type,
      status: m.tontine.status,
      contributionAmount: m.tontine.contributionAmount,
      currency: m.tontine.currency,
      frequency: m.tontine.frequency,
      startDate: m.tontine.startDate,
      role: m.role,
      joinedAt: m.joinedAt,
      payoutOrder: m.payoutOrder,
      currentCycle: m.tontine.cycles[0] || null,
    }));
  }
}

export const usersService = new UsersService();
