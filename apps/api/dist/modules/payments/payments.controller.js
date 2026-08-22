import { getPrisma } from "../../config/database.js";
import { MockProvider } from "./providers/mock.provider.js";
import { WaveProvider } from "./providers/wave.provider.js";
export class PaymentsController {
    providers = new Map([
        ["MOCK", new MockProvider()],
        ["WAVE", new WaveProvider()],
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
            const tontine = await getPrisma().tontine.findUnique({
                where: { id: tontineId },
                include: { rules: true },
            });
            if (!tontine) {
                return res.status(404).json({ error: "Tontine not found" });
            }
            const providerType = method === "WAVE" ? "WAVE" : "MOCK";
            const provider = this.providers.get(providerType);
            if (!provider) {
                return res.status(400).json({ error: "Payment provider not available" });
            }
            const reference = `CONTRIB_${Date.now()}_${member.id}`;
            const result = await provider.initiatePayment({
                amount,
                currency: tontine.currency,
                phoneNumber,
                reference,
            });
            if (result.success) {
                await getPrisma().contribution.create({
                    data: {
                        cycleId,
                        memberId: member.id,
                        amount,
                        status: "PROCESSING",
                        method: method,
                        providerRef: result.providerRef,
                    },
                });
            }
            res.status(200).json({ payment: result });
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
            const provider = this.providers.get("MOCK");
            if (!provider) {
                return res.status(400).json({ error: "Provider not available" });
            }
            const status = await provider.checkPaymentStatus(providerRef);
            res.json({ status });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=payments.controller.js.map