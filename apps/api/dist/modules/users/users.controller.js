import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import bcrypt from "bcrypt";
export class UsersController {
    async getProfile(req, res, next) {
        try {
            const userId = req.userId;
            const user = await getPrisma().user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    phone: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    trustProfile: true,
                },
            });
            res.json({ user });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.userId;
            const data = req.body;
            const user = await getPrisma().user.update({
                where: { id: userId },
                data,
                select: {
                    id: true,
                    phone: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    updatedAt: true,
                },
            });
            logger.info("Profile updated", { userId });
            res.json({ user });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const userId = req.userId;
            const { currentPassword, newPassword } = req.body;
            const user = await getPrisma().user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            if (!currentPassword || !newPassword || newPassword.length < 8) {
                return res.status(400).json({
                    error: "Invalid password",
                    message: "Provide your current password and a new password of at least 8 characters.",
                });
            }
            const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!passwordMatches) {
                return res.status(401).json({
                    error: "Unauthorized",
                    message: "Current password is incorrect.",
                });
            }
            const newPasswordHash = await bcrypt.hash(newPassword, 12);
            await getPrisma().user.update({
                where: { id: userId },
                data: { passwordHash: newPasswordHash },
            });
            logger.info("Password changed", { userId });
            res.json({ message: "Password changed successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getTrustProfile(req, res, next) {
        try {
            const userId = req.userId;
            const trustProfile = await getPrisma().trustProfile.findUnique({
                where: { userId },
            });
            if (!trustProfile) {
                return res.status(404).json({ error: "Trust profile not found" });
            }
            res.json({ trustProfile });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserTontines(req, res, next) {
        try {
            const userId = req.userId;
            const memberships = await getPrisma().tontineMember.findMany({
                where: { userId, status: "ACTIVE" },
                include: {
                    tontine: {
                        include: {
                            cycles: {
                                where: { status: { in: ["OPEN", "FUNDED", "PAYOUT_PENDING"] } },
                                orderBy: { sequence: "desc" },
                                take: 1,
                            },
                        },
                    },
                },
            });
            res.json({
                tontines: memberships.map((m) => ({
                    id: m.tontine.id,
                    name: m.tontine.name,
                    type: m.tontine.type,
                    status: m.tontine.status,
                    contributionAmount: m.tontine.contributionAmount,
                    currency: m.tontine.currency,
                    frequency: m.tontine.frequency,
                    startDate: m.tontine.startDate,
                    role: m.role,
                    joinedAt: m.joinedAt,
                    payoutOrder: m.payoutOrder,
                    currentCycle: m.tontine.cycles[0] || null,
                })),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=users.controller.js.map