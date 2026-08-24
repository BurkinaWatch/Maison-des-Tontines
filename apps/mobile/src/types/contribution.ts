export type ContributionStatus = "pending" | "paid" | "late" | "missed";
export type PaymentMethod = "mobile_money" | "bank_transfer" | "cash" | "card";
export type Currency =
  | "XOF"
  | "XAF"
  | "USD"
  | "EUR"
  | "GBP"
  | "NGN"
  | "GHS"
  | "GNF"
  | "KES"
  | "UGX"
  | "TZS"
  | "RWF"
  | "BIF"
  | "MRU";
export type PayoutStatus = "pending" | "processing" | "completed" | "failed";
export type DisputeStatus = "open" | "under_review" | "resolved" | "closed";

export interface Contribution {
  id: string;
  tontineId: string;
  tontineName: string;
  cycleId: string;
  userId: string;
  amount: number;
  currency: Currency;
  status: ContributionStatus;
  method?: PaymentMethod;
  reference?: string;
  paidAt?: string;
  dueDate: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  tontineId: string;
  tontineName: string;
  cycleId: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  currency: Currency;
  status: PayoutStatus;
  method: PaymentMethod;
  reference?: string;
  processedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  tontineId: string;
  tontineName: string;
  cycleId?: string;
  contributionId?: string;
  raisedById: string;
  raisedByName: string;
  againstId?: string;
  againstName?: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  disputeId: string;
  voterId: string;
  voterName: string;
  vote: "approve" | "reject" | "abstain";
  comment?: string;
  votedAt: string;
}
