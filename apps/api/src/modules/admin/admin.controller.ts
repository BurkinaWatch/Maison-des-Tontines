import { Response, NextFunction } from "express";
import { getPrisma } from "../../config/database.js";
import { auditLogger } from "../audit/audit.logger.js";

export class AdminController {
  async overview(_req: any, res: Response, next: NextFunction) {
    try {
      const prisma = getPrisma();
      const [users, tontines, payments, disputes, auditEvents] = await Promise.all([
        prisma.user.count(), prisma.tontine.count(), prisma.paymentTransaction.count(),
        prisma.dispute.count({ where: { status: "OPEN" } }), prisma.auditLog.count(),
      ]);
      res.json({ users, tontines, payments, openDisputes: disputes, auditEvents });
    } catch (error) { next(error); }
  }

  async users(req: any, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(Number(req.query.limit || 50), 100);
      const users = await getPrisma().user.findMany({
        take: limit, orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
      });
      res.json({ users });
    } catch (error) { next(error); }
  }

  async tontines(req: any, res: Response, next: NextFunction) {
    try {
      const tontines = await getPrisma().tontine.findMany({
        take: Math.min(Number(req.query.limit || 50), 100), orderBy: { createdAt: "desc" },
        select: { id: true, name: true, status: true, currency: true, contributionAmount: true, createdAt: true, _count: { select: { members: true, cycles: true } } },
      });
      res.json({ tontines });
    } catch (error) { next(error); }
  }

  async payments(req: any, res: Response, next: NextFunction) {
    try {
      const payments = await getPrisma().paymentTransaction.findMany({
        take: Math.min(Number(req.query.limit || 50), 100), orderBy: { createdAt: "desc" },
        select: { id: true, userId: true, amount: true, currency: true, status: true, provider: true, createdAt: true },
      });
      res.json({ payments });
    } catch (error) { next(error); }
  }

  async disputes(req: any, res: Response, next: NextFunction) {
    try {
      const disputes = await getPrisma().dispute.findMany({
        take: Math.min(Number(req.query.limit || 50), 100), orderBy: { openedAt: "desc" },
        select: { id: true, tontineId: true, cycleId: true, type: true, status: true, openedById: true, openedAt: true, resolvedAt: true },
      });
      res.json({ disputes });
    } catch (error) { next(error); }
  }

  async suspendUser(req: any, res: Response, next: NextFunction) {
    try {
      const user = await getPrisma().user.update({
        where: { id: req.params.userId }, data: { status: "SUSPENDED" },
        select: { id: true, status: true },
      });
      await Promise.all([
        getPrisma().refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
        getPrisma().session.deleteMany({ where: { userId: user.id } }),
      ]);
      await auditLogger.log(req.userId, req.user?.role || "UNKNOWN", "USER_SUSPENDED", "user", user.id, { reason: req.body?.reason || "admin action" }, req.ip);
      res.json({ user });
    } catch (error) { next(error); }
  }
}