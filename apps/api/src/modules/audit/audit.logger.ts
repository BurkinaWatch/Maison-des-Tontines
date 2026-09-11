import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";

export class AuditLogger {
  async log(
    actorId: string | null,
    actorRole: string,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: any,
    ipAddress?: string
  ) {
    try {
      await getPrisma().auditLog.create({
        data: {
          actorId,
          actorRole,
          action,
          resource,
          resourceId: resourceId || null,
          metadata: typeof metadata === "string" ? metadata : JSON.stringify(metadata || {}),
          ipAddress: ipAddress || "unknown",
        },
      });
    } catch (error) {
      logger.error("Audit log failed", { error: (error as Error).message });
    }
  }

  async query(filters: {
    actorId?: string;
    resource?: string;
    resourceId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const prisma = getPrisma();
    const where: any = {};

    if (filters.actorId) where.actorId = filters.actorId;
    if (filters.resource) where.resource = filters.resource;
    if (filters.resourceId) where.resourceId = filters.resourceId;
    if (filters.action) where.action = { contains: filters.action };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export const auditLogger = new AuditLogger();
