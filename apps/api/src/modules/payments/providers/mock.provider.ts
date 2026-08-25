import type {
  PaymentProviderInterface,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentStatusResponse,
  WebhookVerificationResult,
} from "../../../types/payment.types.js";

export class MockProvider implements PaymentProviderInterface {
  name = "mock";
  type = "MOCK";

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    const providerRef = `MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

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
