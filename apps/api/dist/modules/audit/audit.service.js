import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
export class AuditService {
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
            getPrisma().auditLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: filters.limit || 50,
                skip: filters.offset || 0,
            }),
            getPrisma().auditLog.count({ where }),
        ]);
        return { logs, total };
    }
}
export const auditService = new AuditService();
//# sourceMappingURL=audit.service.js.map