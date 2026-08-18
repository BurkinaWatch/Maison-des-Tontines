export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum DisputeType {
  MISSING_PAYMENT = 'MISSING_PAYMENT',
  LATE_PAYMENT = 'LATE_PAYMENT',
  RULE_VIOLATION = 'RULE_VIOLATION',
  MEMBER_CONFLICT = 'MEMBER_CONFLICT',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  OTHER = 'OTHER',
}

export interface Dispute {
  id: string;
  tontineId: string;
  cycleId: string | null;
  raisedById: string;
  type: DisputeType;
  status: DisputeStatus;
  title: string;
  description: string;
  evidence: string[];
  resolution: string | null;
  resolvedById: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tontine?: Tontine;
  cycle?: Cycle;
  raisedBy?: User;
  resolvedBy?: User;
  comments?: DisputeComment[];
}

export interface DisputeComment {
  id: string;
  disputeId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user?: User;
}

export interface CreateDisputeInput {
  tontineId: string;
  cycleId?: string;
  type: DisputeType;
  title: string;
  description: string;
  evidence?: string[];
}

export interface UpdateDisputeInput {
  status?: DisputeStatus;
  resolution?: string;
  resolvedById?: string;
  resolvedAt?: Date;
}
