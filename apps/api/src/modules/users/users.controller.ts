import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { authMiddleware } from "../../middleware/auth.js";
import { rbacMiddleware } from "../../middleware/rbac.js";
import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import { UpdateProfileDto, ChangePasswordDto } from "./dto/update-profile.dto.js";
import bcrypt from "bcrypt";

const router = Router();
const prisma = getPrisma();

router.get("/me", authMiddleware, async (req: any, res: any, next: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
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
});

router.patch(
  "/me",
  authMiddleware,
  validate(UpdateProfileDto),
  async (req: any, res: any, next: any) => {
    try {
      const data = req.body as UpdateProfileDto;
      const user = await prisma.user.update({
        where: { id: req.userId },
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

      logger.info("Profile updated", { userId: req.userId });
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/me/password",
  authMiddleware,
  validate(ChangePasswordDto),
  async (req: any, res: any, next: any) => {
    try {
      const { currentPassword, newPassword } = req.body as ChangePasswordDto;

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid current password" });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: req.userId },
        data: { passwordHash: newPasswordHash },
      });

      logger.info("Password changed", { userId: req.userId });
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/me/trust-profile",
  authMiddleware,
  async (req: any, res: any, next: any) => {
    try {
      const trustProfile = await prisma.trustProfile.findUnique({
        where: { userId: req.userId },
      });

      if (!trustProfile) {
        return res.status(404).json({ error: "Trust profile not found" });
      }

      res.json({ trustProfile });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/me/tontines",
  authMiddleware,
  async (req: any, res: any, next: any) => {
    try {
      const memberships = await prisma.tontineMember.findMany({
        where: { userId: req.userId, status: "ACTIVE" },
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
);

export default router;
