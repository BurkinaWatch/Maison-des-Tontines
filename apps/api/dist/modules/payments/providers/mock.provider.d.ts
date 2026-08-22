import type { PaymentProviderInterface, PaymentInitiationRequest, PaymentInitiationResponse, PaymentStatusResponse, WebhookVerificationResult } from "../../../types/payment.types.js";
export declare class MockProvider implements PaymentProviderInterface {
    name: string;
    type: string;
    initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;
    checkPaymentStatus(providerRef: string): Promise<PaymentStatusResponse>;
    verifyWebhook(payload: any, signature: string): Promise<WebhookVerificationResult>;
    refund(providerRef: string, amount: number): Promise<PaymentInitiationResponse>;
}
//# sourceMappingURL=mock.provider.d.ts.map