export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentType {
  CONTRIBUTION = 'CONTRIBUTION',
  PAYOUT = 'PAYOUT',
  PENALTY = 'PENALTY',
  REFUND = 'REFUND',
  FEE = 'FEE',
}

export interface Payment {
  id: string;
  tontineId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  method: PaymentMethod;
  reference: string | null;
  transactionId: string | null;
  failureReason: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  tontine?: Tontine;
  contributions?: Contribution[];
}

export interface CreatePaymentInput {
  tontineId: string;
  userId: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  reference?: string;
}

export interface PaymentSummary {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
}
