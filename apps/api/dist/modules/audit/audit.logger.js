import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
export class AuditLogger {
    async log(actorId, actorRole, action, resource, resourceId, metadata, ipAddress) {
        try {
            await getPrisma().auditLog.create({
                data: {
                    actorId,
                    actorRole,
                    action,
                    resource,
                    resourceId: resourceId || null,
                    metadata: metadata || {},
                    ipAddress: ipAddress || "unknown",
                },
            });
        }
        catch (error) {
            logger.error("Audit log failed", { error: error.message });
        }
    }
    async query(filters) {
        const prisma = getPrisma();
        const where = {};
        if (filters.actorId)
            where.actorId = filters.actorId;
        if (filters.resource)
            where.resource = filters.resource;
        if (filters.resourceId)
            where.resourceId = filters.resourceId;
        if (filters.action)
            where.action = { contains: filters.action };
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate)
                where.createdAt.gte = filters.startDate;
            if (filters.endDate)
                where.createdAt.lte = filters.endDate;
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
//# sourceMappingURL=audit.logger.js.map