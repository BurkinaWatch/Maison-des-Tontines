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
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        try {
            const currentUser = await getPrisma().user.findUnique({
                where: { id: req.userId },
                select: { role: true, status: true },
            });
            if (!currentUser || currentUser.status !== "ACTIVE") {
                return res.status(403).json({ error: "Forbidden", message: "Account is inactive" });
            }
            req.user.role = currentUser.role;
            if (!allowedRoles.includes(currentUser.role)) {
                return res.status(403).json({
                    error: "Forbidden",
                    message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
                });
            }
        }
        catch (error) {
            logger.error("Global role check failed", { error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
        next();
    };
}
export function requireTontineRole(tontineIdParam, ...allowedRoles) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const prisma = getPrisma();
        const tontineId = req.params[tontineIdParam];
        if (!tontineId) {
            return res.status(400).json({ error: "Missing tontine identifier" });
        }
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
            req.membership = membership;
            next();
        }
        catch (error) {
            logger.error("Tontine role check failed", { error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    };
}
export function requireTontineMembership(tontineParam = "tontineId") {
    return async (req, res, next) => {
        if (!req.userId)
            return res.status(401).json({ error: "Unauthorized" });
        const tontineId = req.params[tontineParam];
        if (!tontineId)
            return res.status(400).json({ error: "Invalid tontine identifier" });
        try {
            const membership = await getPrisma().tontineMember.findFirst({
                where: { tontineId, userId: req.userId, status: "ACTIVE" },
                select: { id: true, role: true },
            });
            if (!membership) {
                return res.status(403).json({ error: "Forbidden", message: "Not a member of this tontine" });
            }
            req.params = { ...req.params, membershipId: membership.id };
            next();
        }
        catch (error) {
            logger.error("Tontine membership check failed", { error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    };
}
export function requireCycleMembership(cycleParam = "cycleId") {
    return async (req, res, next) => {
        if (!req.userId)
            return res.status(401).json({ error: "Unauthorized" });
        try {
            const cycle = await getPrisma().tontineCycle.findUnique({
                where: { id: req.params[cycleParam] },
                select: { tontineId: true },
            });
            if (!cycle)
                return res.status(404).json({ error: "Cycle not found" });
            const membership = await getPrisma().tontineMember.findFirst({
                where: { tontineId: cycle.tontineId, userId: req.userId, status: "ACTIVE" },
                select: { id: true },
            });
            if (!membership) {
                return res.status(403).json({ error: "Forbidden", message: "Not a member of this tontine" });
            }
            next();
        }
        catch (error) {
            logger.error("Cycle membership check failed", { error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    };
}
export function requireCycleInTontine(tontineParam = "tontineId", cycleParam = "cycleId") {
    return async (req, res, next) => {
        if (!req.userId)
            return res.status(401).json({ error: "Unauthorized" });
        const tontineId = req.params[tontineParam];
        const cycleId = req.params[cycleParam];
        if (!tontineId || !cycleId) {
            return res.status(400).json({ error: "Invalid tontine or cycle identifier" });
        }
        try {
            const cycle = await getPrisma().tontineCycle.findFirst({
                where: { id: cycleId, tontineId },
                select: { id: true },
            });
            if (!cycle)
                return res.status(404).json({ error: "Cycle not found in this tontine" });
            const membership = await getPrisma().tontineMember.findFirst({
                where: { tontineId, userId: req.userId, status: "ACTIVE" },
                select: { id: true },
            });
            if (!membership) {
                return res.status(403).json({ error: "Forbidden", message: "Not a member of this tontine" });
            }
            next();
        }
        catch (error) {
            logger.error("Tontine cycle access check failed", { error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    };
}
//# sourceMappingURL=auth.js.map