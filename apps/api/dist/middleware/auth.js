import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.js";
import { getPrisma } from "../config/database.js";
import { logger } from "../config/logger.js";
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized", message: "Missing or invalid token" });
    }
    const token = authHeader.split(" ")[1];
    const env = getEnv();
    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
        req.user = payload;
        req.userId = payload.sub;
        next();
    }
    catch (error) {
        logger.warn("Invalid token", { error: error.message });
        return res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
    }
}
export function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }
    const token = authHeader.split(" ")[1];
    const env = getEnv();
    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
        req.user = payload;
        req.userId = payload.sub;
    }
    catch {
        // Silently ignore invalid token for optional auth
    }
    next();
}
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Forbidden",
                message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
            });
        }
        next();
    };
}
export function requireTontineRole(tontineId, ...allowedRoles) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const prisma = getPrisma();
        try {
            const membership = await prisma.tontineMember.findFirst({
                where: {
                    tontineId,
                    userId: req.userId,
                    status: "ACTIVE",
                },
            });
            if (!membership) {
                return res.status(403).json({ error: "Forbidden", message: "Not a member of this tontine" });
            }
            if (!allowedRoles.includes(membership.role)) {
                return res.status(403).json({
                    error: "Forbidden",
                    message: `Required tontine role: ${allowedRoles.join(", ")}`,
                });
            }
            req.params = { ...req.params, membershipId: membership.id };
            next();
        }
        catch (error) {
            logger.error("Tontine role check failed", { error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    };
}
//# sourceMappingURL=auth.js.map