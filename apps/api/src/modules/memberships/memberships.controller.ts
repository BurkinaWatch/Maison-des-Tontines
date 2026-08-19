import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";
import { tontineEngineModule } from "../tontines/tontine-engine/module.js";

export class MembershipsController {
  async inviteMember(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId } = req.params;
      const { phone } = req.body;
      const userId = req.userId!;

      const normalizedPhone = phone.replace(/[\s\-()]/g, "").replace(/^00/, "+");
      if (!/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
        return res.status(400).json({ error: "Invalid phone number" });
      }

      const tontine = await getPrisma().tontine.findUnique({
        where: { id: tontineId },
      });

      if (!tontine) {
        return res.status(404).json({ error: "Tontine not found" });
      }

      const memberCount = await getPrisma().tontineMember.count({
        where: { tontineId, status: "ACTIVE" },
      });

      if (tontine.maxMembers && memberCount >= tontine.maxMembers) {
        return res.status(400).json({ error: "Tontine is full" });
      }

      let user = await getPrisma().user.findFirst({
        where: { phone: normalizedPhone },
      });

      if (!user) {
        const tempPassword = Math.random().toString(36).slice(2);
        const passwordHash = await bcrypt.hash(tempPassword, 12);

        user = await getPrisma().user.create({
          data: {
            phone: normalizedPhone,
            name: normalizedPhone,
            passwordHash,
          },
        });
      }

      const existingMembership = await getPrisma().tontineMember.findFirst({
        where: { tontineId, userId: user.id },
      });

      if (existingMembership) {
        return res.status(400).json({ error: "User is already a member" });
      }

      const maxOrder = await getPrisma().tontineMember.findFirst({
        where: { tontineId },
        orderBy: { payoutOrder: "desc" },
        select: { payoutOrder: true },
      });

      const membership = await getPrisma().tontineMember.create({
        data: {
          tontineId,
          userId: user.id,
          role: "MEMBER",
          status: "ACTIVE",
          payoutOrder: (maxOrder?.payoutOrder || 0) + 1,
        },
        include: { user: { select: { id: true, phone: true, name: true } } },
      });

      if (tontine.status === "INVITING") {
        await getPrisma().tontine.update({
          where: { id: tontineId },
          data: { status: "ACTIVE" },
        });
      }

      await tontineEngineModule.getCycleService().createCycles(tontineId, tontine.frequency, tontine.startDate, memberCount + 1);

      logger.info("Member invited", { tontineId, userId: user.id });
      res.status(201).json({ membership });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId, memberId } = req.params;

      await getPrisma().tontineMember.update({
        where: { id: memberId },
        data: { status: "INACTIVE", leftAt: new Date() },
      });

      logger.info("Member removed", { tontineId, memberId });
      res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
      next(error);
    }
  }
}
