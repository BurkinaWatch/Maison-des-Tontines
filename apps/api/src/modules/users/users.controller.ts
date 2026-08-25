import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import bcrypt from "bcrypt";
import { ChangePasswordDto, UpdateProfileDto } from "./dto/update-profile.dto.js";
import { CreatePaymentMethodDto } from "./dto/payment-method.dto.js";

export class UsersController {
  private serializePaymentMethod(method: {
    id: string;
    type: string;
    label: string;
    provider: string | null;
    cardBrand: string | null;
    last4: string;
    createdAt: Date;
  }) {
    return {
      id: method.id,
      type: method.type,
      label: method.label,
      provider: method.provider,
      cardBrand: method.cardBrand,
      maskedValue: `•••• ${method.last4}`,
      createdAt: method.createdAt,
    };
  }

  async getPaymentMethods(req: any, res: Response, next: NextFunction) {
    try {
      const methods = await getPrisma().userPaymentMethod.findMany({
        where: { userId: req.userId! },
        orderBy: { createdAt: "desc" },
      });
      res.json({ paymentMethods: methods.map((method) => this.serializePaymentMethod(method)) });
    } catch (error) {
      next(error);
    }
  }

  async createPaymentMethod(req: any, res: Response, next: NextFunction) {
    try {
      const data = CreatePaymentMethodDto.parse(req.body);
      const isMobileMoney = data.type === "MOBILE_MONEY";
      const sensitiveValue = isMobileMoney ? data.phone : data.cardNumber;
      const last4 = sensitiveValue.slice(-4);
      const method = await getPrisma().userPaymentMethod.create({
        data: {
          userId: req.userId!,
          type: data.type,
          label: data.label,
          provider: isMobileMoney ? data.provider : null,
          cardBrand: isMobileMoney ? null : data.cardBrand,
          last4,
        },
      });
      logger.info("Payment method added", { userId: req.userId!, type: data.type });
      res.status(201).json({ paymentMethod: this.serializePaymentMethod(method) });
    } catch (error) {
      next(error);
    }
  }

  async deletePaymentMethod(req: any, res: Response, next: NextFunction) {
    try {
      const result = await getPrisma().userPaymentMethod.deleteMany({
        where: { id: req.params.paymentMethodId, userId: req.userId! },
      });
      if (result.count === 0) {
        return res.status(404).json({ error: "Payment method not found" });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const user = await getPrisma().user.findUnique({
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
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const data = UpdateProfileDto.parse(req.body);

      const user = await getPrisma().user.update({
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

      logger.info("Profile updated", { userId });
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { currentPassword, newPassword } = ChangePasswordDto.parse(req.body);

      const user = await getPrisma().user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!passwordMatches) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Current password is incorrect.",
        });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      await getPrisma().user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
      await getPrisma().refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      logger.info("Password changed", { userId });
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getTrustProfile(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;

      const trustProfile = await getPrisma().trustProfile.findUnique({
        where: { userId },
      });

      if (!trustProfile) {
        return res.status(404).json({ error: "Trust profile not found" });
      }

      res.json({ trustProfile });
    } catch (error) {
      next(error);
    }
  }

  async getUserTontines(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;

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

      res.json({
        tontines: memberships.map((m) => ({
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
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}
