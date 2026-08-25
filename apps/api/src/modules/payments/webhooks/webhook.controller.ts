import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../../config/database.js";
import { logger } from "../../../config/logger.js";
import { getEnv } from "../../../config/env.js";
import { LiquidCashProvider } from "../providers/liquidcash.provider.js";
import { WaveProvider } from "../providers/wave.provider.js";

export class WebhookController {
  async handleWaveWebhook(req: any, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const signature = req.headers["x-wave-signature"] as string;

      const provider = await getPrisma().paymentProvider.findFirst({
        where: { name: "wave", type: "WAVE" },
      });

      if (!provider || (!provider.webhookSecretRef && !getEnv().WAVE_WEBHOOK_SECRET)) {
        return res.status(500).json({ error: "Wave provider not configured" });
      }

      const verification = await new WaveProvider().verifyWebhook(payload, signature ?? "");
      if (!verification.valid) {
        return res.status(401).json({ error: "Invalid webhook signature" });
      }
      logger.info("Wave webhook received", { event: payload.event, providerRef: payload.id });

      await this.confirmPayment({
        providerRef: payload.id,
        status: payload.event === "payment.completed" ? "SUCCESS" : payload.status,
        amount: payload.amount,
        currency: payload.currency,
      });

      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  async handleLiquidCashWebhook(req: any, res: Response, next: NextFunction) {
    try {
      const provider = new LiquidCashProvider();
      const verification = await provider.verifyWebhook(
        req.body,
        String(req.headers["x-liquidcash-signature"] ?? "")
      );
      if (!verification.valid) {
        return res.status(401).json({ error: "Invalid webhook signature" });
      }
      await this.confirmPayment(verification.payload);
      return res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  private async confirmPayment(payload: any) {
    const providerRef = payload.providerRef ?? payload.id ?? payload.transactionId;
    const transaction = await getPrisma().paymentTransaction.findFirst({
      where: { providerRef },
      include: { contribution: true, cycle: true },
    });
    if (!transaction || !transaction.contributionId || !transaction.cycleId || !transaction.contribution) {
      throw new Error("Payment transaction not found");
    }
    if (Number(payload.amount) !== Number(transaction.amount) ||
      (payload.currency && payload.currency !== transaction.currency)) {
      throw new Error("Payment amount or currency mismatch");
    }
    if (transaction.status === "SUCCESS" || transaction.contribution.status === "PAID") return;
    const success = ["SUCCESS", "SUCCEEDED", "COMPLETED", "PAID"].includes(String(payload.status).toUpperCase());
    const status = success ? "SUCCESS" : ["FAILED", "CANCELLED", "EXPIRED"].includes(String(payload.status).toUpperCase()) ? String(payload.status).toUpperCase() : "PROCESSING";
    await getPrisma().$transaction(async (tx) => {
      const current = await tx.paymentTransaction.findUnique({ where: { id: transaction.id } });
      if (!current || current.status === "SUCCESS") return;
      await tx.paymentTransaction.update({ where: { id: transaction.id }, data: { status } });
      if (status === "SUCCESS") {
        await tx.contribution.update({ where: { id: transaction.contributionId! }, data: { status: "PAID", confirmedAt: new Date() } });
        const total = await tx.contribution.aggregate({
          where: { cycleId: transaction.cycleId!, status: { in: ["PAID", "LATE"] } }, _sum: { amount: true },
        });
        await tx.tontineCycle.update({ where: { id: transaction.cycleId! }, data: { potReceived: total._sum.amount ?? 0 } });
      } else if (["FAILED", "CANCELLED", "EXPIRED"].includes(status)) {
        await tx.contribution.update({ where: { id: transaction.contributionId! }, data: { status } });
      }
    });
  }
}
