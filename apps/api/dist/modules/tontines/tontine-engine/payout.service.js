import { getPrisma } from "../../../config/database.js";
import { logger } from "../../../config/logger.js";
const TontineStatus = {
    DRAFT: "DRAFT",
    INVITING: "INVITING",
    ACTIVE: "ACTIVE",
    PAUSED: "PAUSED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    DISPUTED: "DISPUTED",
};
const CycleStatus = {
    UPCOMING: "UPCOMING",
    OPEN: "OPEN",
    PARTIALLY_FUNDED: "PARTIALLY_FUNDED",
    FUNDED: "FUNDED",
    PAYOUT_PENDING: "PAYOUT_PENDING",
    COMPLETED: "COMPLETED",
    EXCEPTION: "EXCEPTION",
};
const PayoutStatus = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
};
export class PayoutService {
    engine;
    constructor(engine) {
        this.engine = engine;
    }
    async initiatePayout(tontineId, cycleId, memberId, amount) {
        const prisma = getPrisma();
        const payout = await prisma.payout.create({
            data: {
                tontineId,
                cycleId,
                memberId,
                amount,
                status: PayoutStatus.PENDING,
                method: "MANUAL",
                initiatedAt: new Date(),
            },
            include: {
                member: { include: { user: true } },
                cycle: true,
                tontine: true,
            },
        });
        await prisma.tontineCycle.update({
            where: { id: cycleId },
            data: { status: CycleStatus.PAYOUT_PENDING },
        });
        logger.info("Payout initiated", { payoutId: payout.id, tontineId, cycleId, memberId, amount });
        return payout;
    }
    async completePayout(payoutId) {
        const prisma = getPrisma();
        const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
        if (!payout) {
            throw new Error("Payout not found");
        }
        const updatedPayout = await prisma.payout.update({
            where: { id: payoutId },
            data: {
                status: PayoutStatus.COMPLETED,
                completedAt: new Date(),
            },
        });
        await prisma.tontineMember.update({
            where: { id: payout.memberId },
            data: { isPayoutReceived: true },
        });
        logger.info("Payout completed", { payoutId });
        return updatedPayout;
    }
    async failPayout(payoutId, reason) {
        const prisma = getPrisma();
        const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
        if (!payout) {
            throw new Error("Payout not found");
        }
        const updatedPayout = await prisma.payout.update({
            where: { id: payoutId },
            data: {
                status: PayoutStatus.FAILED,
                failureReason: reason,
            },
        });
        logger.warn("Payout failed", { payoutId, reason });
        return updatedPayout;
    }
}
//# sourceMappingURL=payout.service.js.map