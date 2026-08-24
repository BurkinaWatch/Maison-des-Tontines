import { getPrisma } from "../../../config/database.js";
import { logger } from "../../../config/logger.js";
import { getEnv } from "../../../config/env.js";
import { createHmac, timingSafeEqual } from "node:crypto";
export class WebhookController {
    async handleWaveWebhook(req, res, next) {
        try {
            const payload = req.body;
            const signature = req.headers["x-wave-signature"];
            const provider = await getPrisma().paymentProvider.findFirst({
                where: { name: "wave", type: "WAVE" },
            });
            const webhookSecret = getEnv().WAVE_WEBHOOK_SECRET;
            if (!provider || !provider.webhookSecretRef || !webhookSecret) {
                return res.status(500).json({ error: "Wave provider not configured" });
            }
            if (!signature) {
                return res.status(401).json({ error: "Invalid webhook signature" });
            }
            const expected = createHmac("sha256", webhookSecret)
                .update(JSON.stringify(payload))
                .digest("hex");
            const received = Buffer.from(signature, "utf8");
            const expectedBuffer = Buffer.from(expected, "utf8");
            if (received.length !== expectedBuffer.length || !timingSafeEqual(received, expectedBuffer)) {
                return res.status(401).json({ error: "Invalid webhook signature" });
            }
            logger.info("Wave webhook received", { event: payload.event, providerRef: payload.id });
            if (payload.event === "payment.completed") {
                const contribution = await getPrisma().contribution.findFirst({
                    where: { providerRef: payload.id },
                    include: { cycle: true },
                });
                if (contribution && contribution.status === "PROCESSING") {
                    await getPrisma().contribution.update({
                        where: { id: contribution.id },
                        data: { status: "PAID", confirmedAt: new Date() },
                    });
                    const tontine = await getPrisma().tontine.findUnique({
                        where: { id: contribution.cycle.tontineId },
                    });
                    if (tontine) {
                        const totalPaid = await getPrisma().contribution.aggregate({
                            where: { cycleId: contribution.cycleId, status: { in: ["PAID", "LATE"] } },
                            _sum: { amount: true },
                        });
                        const memberCount = await getPrisma().tontineMember.count({
                            where: { tontineId: contribution.cycle.tontineId, status: "ACTIVE" },
                        });
                        const requiredAmount = Number(tontine.contributionAmount) * memberCount;
                        const newStatus = Number(totalPaid._sum.amount || 0) >= requiredAmount
                            ? "FUNDED"
                            : "PARTIALLY_FUNDED";
                        await getPrisma().tontineCycle.update({
                            where: { id: contribution.cycleId },
                            data: { status: newStatus, potReceived: totalPaid._sum.amount || 0 },
                        });
                    }
                }
            }
            res.status(200).json({ received: true });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=webhook.controller.js.map