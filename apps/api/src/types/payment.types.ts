export interface PaymentProviderConfig {
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  baseUrl?: string;
}

export interface PaymentInitiationRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  reference: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitiationResponse {
  success: boolean;
  providerRef: string;
  status: string;
  checkoutUrl?: string;
  message?: string;
}

export interface PaymentStatusResponse {
  status: string;
  amount: number;
  currency?: string;
  transactionId: string;
  paidAt?: Date;
}

export interface WebhookVerificationResult {
  valid: boolean;
  payload: any;
  error?: string;
}

export interface PaymentProviderInterface {
  name: string;
  type: string;
  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;
  checkPaymentStatus(providerRef: string): Promise<PaymentStatusResponse>;
  verifyWebhook(payload: any, signature: string): Promise<WebhookVerificationResult>;
  refund(providerRef: string, amount: number): Promise<PaymentInitiationResponse>;
}
