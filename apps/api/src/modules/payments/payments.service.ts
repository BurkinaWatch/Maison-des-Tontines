import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/database.js";

export class PaymentsService {
  async getProviders() {
    return getPrisma().paymentProvider.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true, createdAt: true },
    });
  }

  async initiatePayment(data: any, userId: string) {
    return getPrisma().paymentTransaction.create({
      data: {
        ...data,
        userId,
      },
    });
  }
}
