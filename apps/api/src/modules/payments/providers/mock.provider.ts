import type {
  PaymentProviderInterface,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentStatusResponse,
  WebhookVerificationResult,
} from "../../../types/payment.types.js";
import { getPrisma } from "../../../config/database.js";

export class MockProvider implements PaymentProviderInterface {
  name = "mock";
  type = "MOCK";

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    const providerRef = `MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const prisma = getPrisma();
    const provider = await prisma.paymentProvider.findFirst({
      where: { name: "mock", type: "MOCK" },
    });

    if (!provider) {
      const newProvider = await prisma.paymentProvider.create({
        data: {
          name: "mock",
          type: "MOCK",
          config: JSON.stringify({}),
          isActive: true,
        },
      });

      await prisma.paymentTransaction.create({
        data: {
          providerId: newProvider.id,
          providerRef,
          amount: request.amount,
          currency: request.currency,
          status: "PENDING",
          direction: "IN",
          metadata: JSON.stringify({
            ...request.metadata,
            phoneNumber: request.phoneNumber,
          }),
        },
      });

      return {
        success: true,
        providerRef,
        status: "PENDING",
      };
    }

    await prisma.paymentTransaction.create({
      data: {
        providerId: provider.id,
        providerRef,
        amount: request.amount,
        currency: request.currency,
        status: "PENDING",
        direction: "IN",
        metadata: JSON.stringify({
          ...request.metadata,
          phoneNumber: request.phoneNumber,
        }),
      },
    });

    return {
      success: true,
      providerRef,
      status: "PENDING",
    };
  }

  async checkPaymentStatus(providerRef: string): Promise<PaymentStatusResponse> {
    const prisma = getPrisma();
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { providerRef },
    });

    if (!transaction) {
      return {
        status: "NOT_FOUND",
        amount: 0,
        transactionId: providerRef,
      };
    }

    return {
      status: transaction.status,
      amount: Number(transaction.amount),
      transactionId: transaction.providerRef ?? providerRef,
    };
  }

  async verifyWebhook(payload: any, signature: string): Promise<WebhookVerificationResult> {
    return {
      valid: true,
      payload,
    };
  }

  async refund(providerRef: string, amount: number): Promise<PaymentInitiationResponse> {
    const refundRef = `MOCK_REFUND_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return {
      success: true,
      providerRef: refundRef,
      status: "COMPLETED",
    };
  }
}
