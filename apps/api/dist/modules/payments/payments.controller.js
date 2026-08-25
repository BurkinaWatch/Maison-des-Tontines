import { getPrisma } from "../../config/database.js";
import { MockProvider } from "./providers/mock.provider.js";
import { WaveProvider } from "./providers/wave.provider.js";
import { LiquidCashProvider } from "./providers/liquidcash.provider.js";
import { getEnv } from "../../config/env.js";
import { randomBytes } from "crypto";
export class PaymentsController {
    providers = new Map([
        ["MOCK", new MockProvider()],
        ["WAVE", new WaveProvider()],
        ["LIQUIDCASH", new LiquidCashProvider()],
    ]);
    async getProviders(req, res, next) {
        try {
            const providers = await getPrisma().paymentProvider.findMany({
                where: { isActive: true },
                select: { id: true, name: true, type: true, createdAt: true },
            });
            res.json({ providers });
        }
        catch (error) {
            next(error);
        }
    }
    async initiateContributionPayment(req, res, next) {
        try {
            const { tontineId, cycleId, amount, phoneNumber, method } = req.body;
            const userId = req.userId;
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
                const transaction = await getPrisma().paymentTransaction.findFirst({
                    where: { providerRef: result.providerRef },
                });
                if (transaction) {
                    await getPrisma().paymentTransaction.update({
                        where: { id: transaction.id },
                        data: {
                            internalReference: reference, userId, tontineId, cycleId,
                            contributionId: contribution.id, status: "PROCESSING",
                        },
                    });
                }
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
        }
        catch (error) {
            next(error);
        }
    }
    async initiatePayout(req, res, next) {
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
        }
        catch (error) {
            next(error);
        }
    }
    async checkPaymentStatus(req, res, next) {
        try {
            const { providerRef } = req.params;
            const transaction = await getPrisma().paymentTransaction.findFirst({
                where: { OR: [{ providerRef }, { internalReference: providerRef }] },
            });
            if (!transaction || transaction.userId !== req.userId) {
                return res.status(404).json({ error: "Payment not found" });
            }
            const provider = this.providers.get(transaction.providerId ? (await getPrisma().paymentProvider.findUnique({ where: { id: transaction.providerId } }))?.type ?? "MOCK" : "MOCK");
            if (!provider) {
                return res.status(400).json({ error: "Provider not available" });
            }
            const status = await provider.checkPaymentStatus(transaction.providerRef ?? providerRef);
            res.json({
                status: status.status,
                amount: transaction.amount,
                currency: transaction.currency,
                internalReference: transaction.internalReference,
                contributionId: transaction.contributionId,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=payments.controller.js.map