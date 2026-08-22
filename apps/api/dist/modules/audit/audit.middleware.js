import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
export function auditMiddleware(req, res, next) {
    const originalSend = res.send.bind(res);
    let statusCode = 200;
    res.send = function (body) {
        statusCode = res.statusCode;
        return originalSend(body);
    };
    res.on("finish", async () => {
        try {
            const actorId = req.userId || null;
            const actorRole = req.user?.role || "ANONYMOUS";
            await getPrisma().auditLog.create({
                data: {
                    actorId,
                    actorRole,
                    action: `${req.method}_${req.route?.path || req.path}`,
                    resource: req.params?.tontineId || "unknown",
                    resourceId: req.params?.id || null,
                    metadata: JSON.stringify({
                        method: req.method,
                        path: req.path,
                        status: statusCode,
                        query: req.query,
                        body: req.body ? { ...req.body, password: undefined } : undefined,
                    }),
                    ipAddress: req.ip || "unknown",
                },
            });
        }
        catch (error) {
            logger.error("Audit log failed", { error: error.message });
        }
    });
    next();
}
//# sourceMappingURL=audit.middleware.js.map