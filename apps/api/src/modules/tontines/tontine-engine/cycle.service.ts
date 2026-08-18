import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";
import { TontineEngine } from "./engine.service.js";
import { TontineStatus, CycleStatus } from "@prisma/client";

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

    const totalCycles = memberCount;
    const cycles = [];

    for (let i = 1; i <= totalCycles; i++) {
      const cycleStartDate = new Date(startDate);
      const cycleName = `Cycle ${i} - ${tontine.name}`;

      cycles.push({
        tontineId,
        sequence: i,
        name: cycleName,
        startDate: cycleStartDate,
        status: CycleStatus.UPCOMING,
      });
    }

    await prisma.tontineCycle.createMany({
      data: cycles,
      skipDuplicates: true,
    });

    logger.info("Cycles created", { tontineId, count: totalCycles });
    return cycles;
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
      throw new Error("Cycle already completed");
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
