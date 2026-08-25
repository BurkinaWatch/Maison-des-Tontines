import { getPrisma } from "../../../config/database.js";
import { logger } from "../../../config/logger.js";
import { TontineEngine } from "./engine.service.js";

const TontineStatus = {
  DRAFT: "DRAFT",
  INVITING: "INVITING",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  DISPUTED: "DISPUTED",
} as const;

const CycleStatus = {
  UPCOMING: "UPCOMING",
  OPEN: "OPEN",
  PARTIALLY_FUNDED: "PARTIALLY_FUNDED",
  FUNDED: "FUNDED",
  PAYOUT_PENDING: "PAYOUT_PENDING",
  COMPLETED: "COMPLETED",
  EXCEPTION: "EXCEPTION",
} as const;

export class CycleService {
  constructor(private engine: TontineEngine) {}

  async createCycles(tontineId: string, frequency: string, startDate: Date, memberCount: number) {
    const prisma = getPrisma();
    const tontine = await prisma.tontine.findUnique({
      where: { id: tontineId },
      include: { members: { where: { status: "ACTIVE" } } },
    });

    if (!tontine) {
      throw new Error("Tontine not found");
    }

    const existingCount = await prisma.tontineCycle.count({ where: { tontineId } });
    const totalCycles = Math.max(memberCount, existingCount);
    const cycles = [];

    for (let i = existingCount + 1; i <= totalCycles; i++) {
      const cycleStartDate = this.addFrequency(startDate, frequency, i - 1);
      const nextStartDate = this.addFrequency(startDate, frequency, i);
      const cycleName = `Cycle ${i} - ${tontine.name}`;

      cycles.push({
        tontineId,
        sequence: i,
        name: cycleName,
        startDate: cycleStartDate,
        endDate: new Date(nextStartDate.getTime() - 1),
        status: i === 1 ? CycleStatus.OPEN : CycleStatus.UPCOMING,
      });
    }

    if (cycles.length > 0) await prisma.tontineCycle.createMany({ data: cycles });

    logger.info("Cycles created", { tontineId, count: cycles.length });
    return cycles;
  }

  private addFrequency(date: Date, frequency: string, count: number): Date {
    const result = new Date(date);
    if (frequency === "daily") result.setDate(result.getDate() + count);
    else if (frequency === "weekly") result.setDate(result.getDate() + count * 7);
    else if (frequency === "biweekly") result.setDate(result.getDate() + count * 14);
    else if (frequency === "quarterly") result.setMonth(result.getMonth() + count * 3);
    else if (frequency === "yearly") result.setFullYear(result.getFullYear() + count);
    else result.setMonth(result.getMonth() + count);
    return result;
  }

  async processDueCycles(now = new Date()) {
    const prisma = getPrisma();
    const dueCycles = await prisma.tontineCycle.findMany({
      where: {
        endDate: { lte: now },
        status: { in: [CycleStatus.OPEN, CycleStatus.PARTIALLY_FUNDED, CycleStatus.FUNDED, CycleStatus.PAYOUT_PENDING] },
      },
      select: { id: true, tontineId: true, status: true },
    });
    for (const cycle of dueCycles) {
      if (cycle.status === CycleStatus.OPEN || cycle.status === CycleStatus.PARTIALLY_FUNDED) {
        await prisma.contribution.updateMany({
          where: { cycleId: cycle.id, status: "PENDING" },
          data: { status: "MISSED" },
        });
        await prisma.contribution.updateMany({
          where: { cycleId: cycle.id, status: "PROCESSING" },
          data: { status: "LATE" },
        });
        await this.advanceCycle(cycle.tontineId, cycle.id);
      }
    }
    return dueCycles.length;
  }

  async advanceCycle(tontineId: string, cycleId: string) {
    const prisma = getPrisma();

    const cycle = await prisma.tontineCycle.findFirst({
      where: { id: cycleId, tontineId },
      include: {
        tontine: { include: { members: { where: { status: "ACTIVE" } } } },
        contributions: { where: { status: { in: ["PAID", "LATE"] } } },
      },
    });

    if (!cycle) {
      throw new Error("Cycle not found");
    }

    if (cycle.status === CycleStatus.COMPLETED) {
      return cycle;
    }
    if (cycle.status === CycleStatus.FUNDED || cycle.status === CycleStatus.PAYOUT_PENDING) {
      return cycle;
    }

    const activeMembers = cycle.tontine.members;
    const paidContributions = cycle.contributions;
    const totalPaid = paidContributions.reduce((sum, c) => sum + Number(c.amount), 0);
    const requiredAmount = Number(cycle.tontine.contributionAmount) * activeMembers.length;

    const potReceived = totalPaid;

    if (potReceived < requiredAmount) {
      return prisma.tontineCycle.update({
        where: { id: cycleId },
        data: {
          status: CycleStatus.PARTIALLY_FUNDED,
          potReceived,
        },
      });
    }

    const tontineRules = await prisma.tontineRule.findMany({
      where: { tontineId },
    });

    const engineContext = await this.engine.calculateCycleData(
      tontineId,
      cycle.sequence,
      tontineRules,
      Number(cycle.tontine.contributionAmount)
    );

    const beneficiaryOrder = await this.engine.getBeneficiaryOrder(
      activeMembers.map((m) => ({ id: m.id, payoutOrder: m.payoutOrder })),
      engineContext.rules.rotationType || "fixed"
    );

    const beneficiaryId = await this.engine.selectBeneficiary(beneficiaryOrder, cycle.sequence);

    if (!beneficiaryId) {
      throw new Error("No eligible beneficiary found for this cycle");
    }

    const updatedCycle = await prisma.tontineCycle.update({
      where: { id: cycleId },
      data: {
        status: CycleStatus.FUNDED,
        beneficiaryMemberId: beneficiaryId,
        potAmount: requiredAmount,
        potReceived,
        updatedAt: new Date(),
      },
    });

    await prisma.tontineMember.update({
      where: { id: beneficiaryId },
      data: { isPayoutReceived: true },
    });

    logger.info("Cycle advanced", { cycleId, beneficiaryId, potReceived });
    return updatedCycle;
  }

  async completeCycle(tontineId: string, cycleId: string) {
    const prisma = getPrisma();

    const cycle = await prisma.tontineCycle.findFirst({
      where: { id: cycleId, tontineId },
      include: { payouts: true },
    });

    if (!cycle) {
      throw new Error("Cycle not found");
    }

    if (cycle.status !== CycleStatus.PAYOUT_PENDING && cycle.status !== CycleStatus.FUNDED) {
      throw new Error("Cannot complete cycle in current state");
    }

    const allPayoutsCompleted = cycle.payouts.every((p) => p.status === "COMPLETED");
    if (!allPayoutsCompleted && cycle.payouts.length > 0) {
      throw new Error("Not all payouts have been completed");
    }

    const updatedCycle = await prisma.tontineCycle.update({
      where: { id: cycleId },
      data: {
        status: CycleStatus.COMPLETED,
        endDate: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.checkTontineCompletion(tontineId);

    logger.info("Cycle completed", { cycleId, tontineId });
    return updatedCycle;
  }

  private async checkTontineCompletion(tontineId: string) {
    const prisma = getPrisma();

    const remainingCycles = await prisma.tontineCycle.count({
      where: { tontineId, status: { not: CycleStatus.COMPLETED } },
    });

    if (remainingCycles === 0) {
      await prisma.tontine.update({
        where: { id: tontineId },
        data: { status: TontineStatus.COMPLETED, endDate: new Date() },
      });
      logger.info("Tontine completed", { tontineId });
    }
  }
}
