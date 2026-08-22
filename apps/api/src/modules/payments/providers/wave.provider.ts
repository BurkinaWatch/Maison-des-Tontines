import type {
  PaymentProviderInterface,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentStatusResponse,
  WebhookVerificationResult,
} from "../../../types/payment.types.js";

type WavePaymentResponse = {
  amount?: number;
  id?: string;
  message?: string;
  paid_at?: string;
  status?: string;
};

export class WaveProvider implements PaymentProviderInterface {
  name = "wave";
  type = "WAVE";

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    try {
      const response = await fetch("https://api.wave.com/v1/payment/request", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.WAVE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          phone_number: request.phoneNumber,
          external_id: request.reference,
        }),
      });

      const data = (await response.json()) as WavePaymentResponse;

      if (!response.ok) {
        return {
          success: false,
          providerRef: "",
          status: "FAILED",
          message: data.message || "Payment initiation failed",
        };
      }

      return {
        success: true,
        providerRef: data.id ?? "",
        status: data.status ?? "PENDING",
      };
    } catch (error) {
      return {
        success: false,
        providerRef: "",
        status: "FAILED",
        message: (error as Error).message,
      };
    }
  }

  async checkPaymentStatus(providerRef: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`https://api.wave.com/v1/payment/${providerRef}`, {
        headers: {
          "Authorization": `Bearer ${process.env.WAVE_API_KEY}`,
        },
      });

      const data = (await response.json()) as WavePaymentResponse;

      return {
        status: data.status ?? "UNKNOWN",
        amount: data.amount ?? 0,
        transactionId: providerRef,
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
      };
    } catch (error) {
      return {
        status: "ERROR",
        amount: 0,
        transactionId: providerRef,
      };
    }
  }

  async verifyWebhook(payload: any, signature: string): Promise<WebhookVerificationResult> {
    try {
      const crypto = await import("crypto");
      const expectedSignature = crypto
        .createHmac("sha256", process.env.WAVE_WEBHOOK_SECRET || "")
        .update(JSON.stringify(payload))
        .digest("hex");

      if (signature !== expectedSignature) {
        return {
          valid: false,
          payload: null,
          error: "Invalid webhook signature",
        };
      }

      return {
        valid: true,
        payload,
      };
    } catch (error) {
      return {
        valid: false,
        payload: null,
        error: (error as Error).message,
      };
    }
  }

  async refund(providerRef: string, amount: number): Promise<PaymentInitiationResponse> {
    try {
      const response = await fetch(`https://api.wave.com/v1/payment/${providerRef}/refund`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.WAVE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
        }),
      });

      const data = (await response.json()) as WavePaymentResponse;

      return {
        success: response.ok,
        providerRef: data.id ?? providerRef,
        status: data.status ?? (response.ok ? "COMPLETED" : "FAILED"),
      };
    } catch (error) {
      return {
        success: false,
        providerRef: "",
        status: "FAILED",
        message: (error as Error).message,
      };
    }
  }
}
