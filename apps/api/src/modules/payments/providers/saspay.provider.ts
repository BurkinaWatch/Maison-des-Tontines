import type {
  PaymentProviderInterface,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentStatusResponse,
  WebhookVerificationResult,
} from "../../../types/payment.types.js";
import { getEnv } from "../../../config/env.js";

type SasPayResponse = {
  id?: string;
  status?: string;
  message?: string;
  checkout_url?: string;
  transaction_id?: string | null;
  transaction_status?: string;
  requested_amount?: string;
  amount?: string;
  currency?: string;
  updated_at?: string;
};

export class SasPayProvider implements PaymentProviderInterface {
  name = "saspay";
  type = "SASPAY";

  private get baseUrl() {
    return getEnv().SASPAY_BASE_URL.replace(/\/+$/, "");
  }

  private get headers() {
    const apiKey = getEnv().SASPAY_API_KEY;
    if (!apiKey) throw new Error("SasPay is not configured: SASPAY_API_KEY is missing");
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    if (!request.customerEmail || !request.customerName) {
      return {
        success: false,
        providerRef: "",
        status: "FAILED",
        message: "An email address and customer name are required for SasPay checkout.",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/checkout-sessions/`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          amount: request.amount.toFixed(2),
          currency: request.currency.toUpperCase(),
          customer_email: request.customerEmail,
          customer_name: request.customerName,
          customer_phone: request.phoneNumber,
          description: "Tontine contribution",
          metadata: request.metadata ?? {},
        }),
      });
      const data = (await response.json()) as SasPayResponse;
      if (!response.ok || !data.id || !data.checkout_url) {
        return {
          success: false,
          providerRef: "",
          status: "FAILED",
          message: data.message || `SasPay checkout failed (${response.status})`,
        };
      }
      const checkoutUrl = new URL(data.checkout_url);
      if (checkoutUrl.protocol !== "https:" || !checkoutUrl.hostname.endsWith(".saspay.me")) {
        return {
          success: false,
          providerRef: "",
          status: "FAILED",
          message: "SasPay returned an invalid checkout URL.",
        };
      }
      return {
        success: true,
        providerRef: data.id,
        status: data.status ?? "PENDING",
        checkoutUrl: checkoutUrl.toString(),
      };
    } catch (error) {
      return {
        success: false,
        providerRef: "",
        status: "FAILED",
        message: error instanceof Error ? error.message : "SasPay is unavailable.",
      };
    }
  }

  async checkPaymentStatus(providerRef: string): Promise<PaymentStatusResponse> {
    try {
      const sessionResponse = await fetch(
        `${this.baseUrl}/checkout-sessions/${encodeURIComponent(providerRef)}/status/`,
        { headers: this.headers }
      );
      const session = (await sessionResponse.json()) as SasPayResponse;
      if (!sessionResponse.ok) {
        return { status: "ERROR", amount: 0, transactionId: providerRef };
      }
      if (!session.transaction_id) {
        return {
          status: session.status ?? "PENDING",
          amount: 0,
          transactionId: providerRef,
        };
      }

      // Verify through SasPay's authoritative transaction endpoint before
      // allowing the contribution to be marked paid.
      const verificationResponse = await fetch(
        `${this.baseUrl}/payments/${encodeURIComponent(session.transaction_id)}/verify/`,
        { headers: this.headers }
      );
      const verification = (await verificationResponse.json()) as SasPayResponse;
      if (!verificationResponse.ok) {
        return { status: "ERROR", amount: 0, transactionId: session.transaction_id };
      }
      return {
        status: verification.status ?? session.transaction_status ?? "PENDING",
        amount: Number(verification.requested_amount ?? verification.amount ?? 0),
        currency: verification.currency,
        transactionId: session.transaction_id,
        paidAt: verification.updated_at ? new Date(verification.updated_at) : undefined,
      };
    } catch {
      return { status: "ERROR", amount: 0, transactionId: providerRef };
    }
  }

  async verifyWebhook(): Promise<WebhookVerificationResult> {
    return {
      valid: false,
      payload: null,
      error: "SasPay payments are verified through the signed status API.",
    };
  }

  async refund(providerRef: string): Promise<PaymentInitiationResponse> {
    return {
      success: false,
      providerRef,
      status: "FAILED",
      message: "SasPay refunds are not configured.",
    };
  }
}
