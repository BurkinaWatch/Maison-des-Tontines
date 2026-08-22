import { getPrisma } from "../config/database.js";
import { logger } from "../config/logger.js";
export function rbacMiddleware(allowedRoles) {
    return async (req, res, next) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const user = await getPrisma().user.findUnique({
                where: { id: userId },
                select: { role: true, status: true },
            });
            if (!user) {
                return res.status(401).json({ error: "Unauthorized", message: "User not found" });
            }
            if (user.status !== "ACTIVE") {
                return res.status(403).json({
                    error: "Forbidden",
                    message: `User account is ${user.status.toLowerCase()}`,
                });
            }
            if (!allowedRoles.includes(user.role)) {
                logger.warn("RBAC access denied", {
                    userId,
                    role: user.role,
                    allowedRoles,
                });
                return res.status(403).json({
                    error: "Forbidden",
                    message: "Insufficient permissions",
                });
            }
            next();
        }
        catch (error) {
            logger.error("RBAC middleware error", { error: error.message });
            return res.status(500).json({ error: "Internal server error" });
        }
    };
}
//# sourceMappingURL=rbac.js.map