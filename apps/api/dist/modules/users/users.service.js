import { getPrisma } from "../../config/database.js";
import { trustService } from "../trust/trust-profile.engine.js";
import bcrypt from "bcrypt";
import { authService } from "../auth/auth.service.js";
export class UsersService {
    async getUserById(userId) {
        return getPrisma().user.findUnique({
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
    }
    async updateProfile(userId, data) {
        return getPrisma().user.update({
            where: { id: userId },
            data: {
                ...(data.name !== undefined && { name: data.name.trim() }),
                ...(data.email !== undefined && { email: data.email === null ? null : data.email.trim().toLowerCase() }),
            },
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
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await getPrisma().user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error("User not found");
        }
        const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!passwordMatches) {
            throw new Error("Current password is incorrect");
        }
        const passwordHash = await bcrypt.hash(newPassword, 12);
        const updatedUser = await getPrisma().user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        await authService.revokeAllRefreshTokens(userId);
        return updatedUser;
    }
    async getTrustProfile(userId) {
        return trustService.getTrustScore(userId);
    }
    async getUserTontines(userId) {
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
        return memberships.map((m) => ({
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
        }));
    }
}
export const usersService = new UsersService();
//# sourceMappingURL=users.service.js.map