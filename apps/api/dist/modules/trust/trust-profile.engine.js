import { getPrisma } from "../../config/database.js";
export class TrustService {
    async getTrustScore(userId) {
        const profile = await getPrisma().trustProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            return { score: 50, reason: "New user" };
        }
        const totalPayments = profile.paymentsOnTime + profile.paymentsLate;
        const paymentRate = totalPayments > 0 ? profile.paymentsOnTime / totalPayments : 0;
        let score = profile.score;
        if (paymentRate > 0.9)
            score += 5;
        else if (paymentRate < 0.5)
            score -= 5;
        score = Math.max(0, Math.min(100, score));
        return {
            score,
            profile,
        };
    }
    async updateTrustScore(userId, action) {
        const profile = await getPrisma().trustProfile.findUnique({
            where: { userId },
        });
        if (!profile)
            return;
        const updates = {};
        switch (action) {
            case "on_time":
                updates.paymentsOnTime = { increment: 1 };
                updates.score = { increment: 2 };
                break;
            case "late":
                updates.paymentsLate = { increment: 1 };
                updates.score = { decrement: 3 };
                break;
            case "dispute_resolved":
                updates.disputesResolved = { increment: 1 };
                updates.score = { increment: 1 };
                break;
            case "dispute_opened":
                updates.disputesUnresolved = { increment: 1 };
                updates.score = { decrement: 2 };
                break;
        }
        await getPrisma().trustProfile.update({
            where: { userId },
            data: updates,
        });
    }
}
export const trustService = new TrustService();
//# sourceMappingURL=trust-profile.engine.js.map