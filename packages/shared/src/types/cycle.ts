export enum CycleStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Cycle {
  id: string;
  tontineId: string;
  cycleNumber: number;
  status: CycleStatus;
  startDate: Date;
  endDate: Date;
  recipientId: string | null;
  potAmount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  tontine?: Tontine;
  recipient?: User;
  contributions?: Contribution[];
  payment?: Payment;
}

export interface CreateCycleInput {
  tontineId: string;
  cycleNumber: number;
  startDate: Date;
  endDate: Date;
  recipientId: string;
}

export interface UpdateCycleInput {
  status?: CycleStatus;
  recipientId?: string;
  potAmount?: number;
}

export interface CycleProgress {
  cycleNumber: number;
  totalMembers: number;
  contributionsReceived: number;
  contributionsExpected: number;
  progressPercentage: number;
  isComplete: boolean;
}
