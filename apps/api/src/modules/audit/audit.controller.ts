import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";

export class AuditController {
  async queryLogs(req: any, res: Response, next: NextFunction) {
    try {
      const { actorId, resource, resourceId, action, startDate, endDate, limit, offset } = req.query;
      const where: any = {};
      if (actorId) where.actorId = actorId;
      if (resource) where.resource = resource;
      if (resourceId) where.resourceId = resourceId;
      if (action) where.action = { contains: action };
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      const [logs, total] = await Promise.all([
        getPrisma().auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: Number(limit || 50), skip: Number(offset || 0) }),
        getPrisma().auditLog.count({ where }),
      ]);
      res.json({ logs, total });
    } catch (error) {
      next(error);
    }
  }

  async getLog(req: any, res: Response, next: NextFunction) {
    try {
      const log = await getPrisma().auditLog.findUnique({ where: { id: req.params.id } });
      if (!log) return res.status(404).json({ error: "Audit log not found" });
      res.json({ log });
    } catch (error) {
      next(error);
    }
  }
}
