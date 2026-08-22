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
const ContributionStatus = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    PAID: "PAID",
    LATE: "LATE",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
    DISPUTED: "DISPUTED",
    REFUNDED: "REFUNDED",
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
export class ContributionService {
    engine;
    latePenaltyRule;
    constructor(engine, latePenaltyRule) {
        this.engine = engine;
        this.latePenaltyRule = latePenaltyRule;
    }
    async recordContribution(tontineId, cycleId, memberId, amount, method = "MANUAL", providerRef) {
        const prisma = getPrisma();
        const contribution = await prisma.contribution.create({
            data: {
                cycleId,
                memberId,
                amount,
                status: ContributionStatus.PAID,
                method,
                providerRef,
                confirmedAt: new Date(),
            },
            include: {
                cycle: {
                    include: { tontine: { include: { rules: true } } },
                },
                member: {
                    include: { user: true },
                },
            },
        });
        await this.updateTrustProfile(memberId, true);
        const tontine = await prisma.tontine.findUnique({
            where: { id: tontineId },
            include: { rules: true },
        });
        if (tontine) {
            const totalPaid = await prisma.contribution.aggregate({
                where: { cycleId, status: { in: [ContributionStatus.PAID, ContributionStatus.LATE] } },
                _sum: { amount: true },
            });
            const memberCount = await prisma.tontineMember.count({
                where: { tontineId, status: "ACTIVE" },
            });
            const requiredAmount = Number(tontine.contributionAmount) * memberCount;
            const currentStatus = Number(totalPaid._sum.amount || 0) >= requiredAmount
                ? CycleStatus.FUNDED
                : CycleStatus.PARTIALLY_FUNDED;
            await prisma.tontineCycle.update({
                where: { id: cycleId },
                data: {
                    status: currentStatus,
                    potReceived: totalPaid._sum.amount || 0,
                },
            });
        }
        logger.info("Contribution recorded", {
            contributionId: contribution.id,
            tontineId,
            cycleId,
            memberId,
            amount,
        });
        return contribution;
    }
    async markLate(contributionId, lateDays) {
        const prisma = getPrisma();
        const contribution = await prisma.contribution.findUnique({
            where: { id: contributionId },
            include: {
                cycle: { include: { tontine: { include: { rules: true } } } },
            },
        });
        if (!contribution) {
            throw new Error("Contribution not found");
        }
        const tontineRules = contribution.cycle.tontine.rules;
        const latePenaltyRateRule = tontineRules.find((r) => r.key === "latePenaltyRate");
        const penaltyRate = latePenaltyRateRule ? parseFloat(latePenaltyRateRule.value) : 0.05;
        const lateFee = await this.engine.calculateLatePenalty(Number(contribution.amount), lateDays, penaltyRate);
        const updatedContribution = await prisma.contribution.update({
            where: { id: contributionId },
            data: {
                status: ContributionStatus.LATE,
                lateFee,
                penaltyApplied: lateFee > 0,
            },
        });
        await this.updateTrustProfile(contribution.memberId, false, lateDays);
        logger.info("Contribution marked as late", {
            contributionId,
            lateDays,
            lateFee,
        });
        return updatedContribution;
    }
    async validateContribution(tontineId, cycleId, memberId, amount) {
        const prisma = getPrisma();
        const tontine = await prisma.tontine.findUnique({
            where: { id: tontineId },
        });
        if (!tontine) {
            throw new Error("Tontine not found");
        }
        if (amount !== Number(tontine.contributionAmount)) {
            throw new Error(`Contribution amount must be exactly ${tontine.contributionAmount} ${tontine.currency}`);
        }
        const membership = await prisma.tontineMember.findFirst({
            where: { tontineId, userId: memberId, status: "ACTIVE" },
        });
        if (!membership) {
            throw new Error("Member not found in tontine");
        }
        const existingContribution = await prisma.contribution.findFirst({
            where: { cycleId, memberId, status: { not: ContributionStatus.CANCELLED } },
        });
        if (existingContribution) {
            throw new Error("Contribution already recorded for this cycle");
        }
        const cycle = await prisma.tontineCycle.findUnique({
            where: { id: cycleId },
        });
        if (!cycle) {
            throw new Error("Cycle not found");
        }
        if (cycle.status === CycleStatus.COMPLETED) {
            throw new Error("Cycle is already completed");
        }
        return { valid: true, membership };
    }
    async updateTrustProfile(memberId, onTime, lateDays = 0) {
        const prisma = getPrisma();
        const membership = await prisma.tontineMember.findUnique({
            where: { id: memberId },
            select: { userId: true },
        });
        if (!membership)
            return;
        const trustProfile = await prisma.trustProfile.findUnique({
            where: { userId: membership.userId },
        });
        if (!trustProfile)
            return;
        if (onTime) {
            await prisma.trustProfile.update({
                where: { userId: membership.userId },
                data: {
                    paymentsOnTime: { increment: 1 },
                    score: { increment: 2 },
                },
            });
        }
        else {
            await prisma.trustProfile.update({
                where: { userId: membership.userId },
                data: {
                    paymentsLate: { increment: 1 },
                    score: { decrement: Math.min(5, lateDays) },
                },
            });
        }
    }
}
//# sourceMappingURL=contribution.service.js.map