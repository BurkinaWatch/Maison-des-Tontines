export enum ContributionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  OVERDUE = 'OVERDUE',
  LATE = 'LATE',
  PARTIAL = 'PARTIAL',
  WAIVED = 'WAIVED',
}

export enum ContributionType {
  REGULAR = 'REGULAR',
  LATE = 'LATE',
  PENALTY = 'PENALTY',
  ADJUSTMENT = 'ADJUSTMENT',
}

export interface Contribution {
  id: string;
  tontineId: string;
  userId: string;
  cycleId: string;
  amount: number;
  currency: string;
  status: ContributionStatus;
  type: ContributionType;
  dueDate: Date;
  paidAt: Date | null;
  paymentId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  cycle?: Cycle;
  payment?: Payment;
  tontine?: Tontine;
}

export interface ContributionSummary {
  totalExpected: number;
  totalPaid: number;
  totalOverdue: number;
  totalLate: number;
  completionRate: number;
}

export interface CreateContributionInput {
  tontineId: string;
  userId: string;
  cycleId: string;
  amount: number;
  dueDate: Date;
  type?: ContributionType;
  notes?: string;
}

export interface UpdateContributionInput {
  status?: ContributionStatus;
  paidAt?: Date;
  paymentId?: string;
  notes?: string;
}
