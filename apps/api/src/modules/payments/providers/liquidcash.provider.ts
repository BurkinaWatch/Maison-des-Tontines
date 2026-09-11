import type {
  PaymentProviderInterface,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentStatusResponse,
  WebhookVerificationResult,
} from "../../../types/payment.types.js";

/**
 * Deliberately fails closed until LiquidCash's official API contract is supplied.
 * No endpoint or payload is guessed here.
 */
export class LiquidCashProvider implements PaymentProviderInterface {
  name = "liquidcash";
  type = "LIQUIDCASH";

  async initiatePayment(_request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    return {
      success: false,
      providerRef: "",
      status: "FAILED",
      message: "LiquidCash is not configured with its official API contract",
    };
  }

  async checkPaymentStatus(providerRef: string): Promise<PaymentStatusResponse> {
    return { status: "UNAVAILABLE", amount: 0, transactionId: providerRef };
  }

  async verifyWebhook(_payload: unknown, _signature: string): Promise<WebhookVerificationResult> {
    return { valid: false, payload: null, error: "LiquidCash webhook contract is not configured" };
  }

  async refund(providerRef: string, _amount: number): Promise<PaymentInitiationResponse> {
    return { success: false, providerRef, status: "FAILED", message: "Refunds are not configured" };
  }
}