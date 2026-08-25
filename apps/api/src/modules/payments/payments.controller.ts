import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import { MockProvider } from "./providers/mock.provider.js";
import { WaveProvider } from "./providers/wave.provider.js";
import { LiquidCashProvider } from "./providers/liquidcash.provider.js";
import { getEnv } from "../../config/env.js";
import { randomBytes } from "crypto";

export class PaymentsController {
  private providers = new Map<string, any>([
    ["MOCK", new MockProvider()],
    ["WAVE", new WaveProvider()],
    ["LIQUIDCASH", new LiquidCashProvider()],
  ]);

  async getProviders(req: any, res: Response, next: NextFunction) {
    try {
      const providers = await getPrisma().paymentProvider.findMany({
        where: { isActive: true },
        select: { id: true, name: true, type: true, createdAt: true },
      });
      res.json({ providers });
    } catch (error) {
      next(error);
    }
  }

  async initiateContributionPayment(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId, cycleId, amount, phoneNumber, method } = req.body;
      const userId = req.userId!;

      const member = await getPrisma().tontineMember.findFirst({
        where: { tontineId, userId, status: "ACTIVE" },
      });

      if (!member) {
        return res.status(403).json({ error: "Not a member of this tontine" });
      }

      const cycle = await getPrisma().tontineCycle.findFirst({
        where: { id: cycleId, tontineId },
        include: { tontine: true },
      });

      if (!cycle) {
        return res.status(404).json({ error: "Cycle not found for this tontine" });
      }

      const officialAmount = Number(cycle.tontine.contributionAmount);
      if (amount !== undefined && Number(amount) !== officialAmount) {
        return res.status(400).json({ error: "Contribution amount does not match the tontine amount" });
      }

      const existing = await getPrisma().contribution.findFirst({
        where: { cycleId, memberId: member.id },
        orderBy: { declaredAt: "desc" },
      });
      if (existing?.status === "PAID" || existing?.status === "LATE") {
        return res.status(409).json({ error: "Contribution is already paid", contribution: existing });
      }

      const configuredProvider = getEnv().PAYMENT_PROVIDER.toUpperCase();
      const providerType = configuredProvider === "LIQUIDCASH"
        ? "LIQUIDCASH"
        : configuredProvider === "WAVE"
          ? "WAVE"
          : "MOCK";
      const provider = this.providers.get(providerType);

      if (!provider) {
        return res.status(400).json({ error: "Payment provider not available" });
      }

      const providerRecord = await getPrisma().paymentProvider.upsert({
        where: { name: provider.name },
        update: { isActive: true, type: providerType },
        create: { name: provider.name, type: providerType, config: JSON.stringify({}), isActive: true },
      });
      if (existing?.status === "PROCESSING") {
        const previous = await getPrisma().paymentTransaction.findFirst({
          where: { contributionId: existing.id, userId, status: { in: ["PENDING", "PROCESSING"] } },
          orderBy: { createdAt: "desc" },
        });
        if (previous) {
          return res.json({
            payment: {
              providerRef: previous.providerRef,
              internalReference: previous.internalReference,
              contributionId: existing.id,
              status: previous.status,
              amount: previous.amount,
              currency: previous.currency,
            },
          });
        }
      }

      const reference = `MDT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomBytes(5).toString("hex").toUpperCase()}`;
      const contribution = existing ?? await getPrisma().contribution.create({
        data: {
          cycleId,
          memberId: member.id,
          amount: officialAmount,
          status: "PENDING",
          method: method ?? "MOBILE_MONEY",
        },
      });
      const result = await provider.initiatePayment({
        amount: officialAmount,
        currency: cycle.tontine.currency,
        phoneNumber,
        reference,
        metadata: { userId, tontineId, cycleId, contributionId: contribution.id },
      });

      if (result.success) {
        await getPrisma().contribution.update({
          where: { id: contribution.id },
          data: { status: "PROCESSING", method: method ?? "MOBILE_MONEY", providerRef: result.providerRef },
        });
        await getPrisma().paymentTransaction.create({
          data: {
            providerId: providerRecord.id,
            providerRef: result.providerRef,
            internalReference: reference,
            userId,
            tontineId,
            cycleId,
            contributionId: contribution.id,
            amount: officialAmount,
            currency: cycle.tontine.currency,
            status: "PROCESSING",
            direction: "IN",
            metadata: JSON.stringify({ phoneNumber, method: method ?? "MOBILE_MONEY" }),
          },
        });
      }

      res.status(200).json({
        payment: {
          ...result,
          internalReference: reference,
          contributionId: contribution.id,
          amount: officialAmount,
          currency: cycle.tontine.currency,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async initiatePayout(req: any, res: Response, next: NextFunction) {
    try {
      const { tontineId, cycleId, memberId, amount, method, phoneNumber } = req.body;

      const payout = await getPrisma().payout.create({
        data: {
          tontineId,
          cycleId,
          memberId,
          amount,
          status: "PROCESSING",
          method,
        },
      });

      if (method === "WAVE") {
        const provider = this.providers.get("WAVE");
        if (provider) {
          const result = await provider.initiatePayment({
            amount,
            currency: "XOF",
            phoneNumber,
            reference: payout.id,
          });

          await getPrisma().payout.update({
            where: { id: payout.id },
            data: { providerRef: result.providerRef },
          });
        }
      }

      res.status(201).json({ payout });
    } catch (error) {
      next(error);
    }
  }

  async checkPaymentStatus(req: any, res: Response, next: NextFunction) {
    try {
      const { providerRef } = req.params;
      const transaction = await getPrisma().paymentTransaction.findFirst({
        where: { OR: [{ providerRef }, { internalReference: providerRef }] },
      });
      if (!transaction || transaction.userId !== req.userId) {
        return res.status(404).json({ error: "Payment not found" });
      }
      const provider = this.providers.get(
        transaction.providerId ? (await getPrisma().paymentProvider.findUnique({ where: { id: transaction.providerId } }))?.type ?? "MOCK" : "MOCK"
      );

      if (!provider) {
        return res.status(400).json({ error: "Provider not available" });
      }

      const status = await provider.checkPaymentStatus(transaction.providerRef ?? providerRef);
      const normalizedStatus = status.status.toUpperCase();
      const success = ["SUCCESS", "SUCCEEDED", "COMPLETED", "PAID"].includes(normalizedStatus);
      const terminalFailure = ["FAILED", "CANCELLED", "EXPIRED"].includes(normalizedStatus);
      if (success || terminalFailure) {
        await getPrisma().$transaction(async (tx) => {
          const current = await tx.paymentTransaction.findUnique({ where: { id: transaction.id } });
          if (!current || ["SUCCESS", "FAILED", "CANCELLED", "EXPIRED"].includes(current.status)) return;
          const nextStatus = success ? "SUCCESS" : normalizedStatus;
          await tx.paymentTransaction.update({ where: { id: transaction.id }, data: { status: nextStatus } });
          if (transaction.contributionId) {
            await tx.contribution.update({
              where: { id: transaction.contributionId },
              data: success ? { status: "PAID", confirmedAt: new Date() } : { status: nextStatus },
            });
          }
        });
      }
      res.json({
        status: normalizedStatus,
        amount: transaction.amount,
        currency: transaction.currency,
        internalReference: transaction.internalReference,
        contributionId: transaction.contributionId,
      });
    } catch (error) {
      next(error);
    }
  }
}
