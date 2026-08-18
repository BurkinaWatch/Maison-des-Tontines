export enum TontineStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}

export enum TontineType {
  ROTATING = 'ROTATING',
  SAVINGS = 'SAVINGS',
  LOTTERY = 'LOTTERY',
  CUSTOM = 'CUSTOM',
}

export enum ContributionFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  CUSTOM = 'CUSTOM',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CHECK = 'CHECK',
  OTHER = 'OTHER',
}

export interface Tontine {
  id: string;
  name: string;
  description: string | null;
  status: TontineStatus;
  type: TontineType;
  contributionAmount: number;
  currency: string;
  contributionFrequency: ContributionFrequency;
  maxMembers: number;
  startDate: Date;
  endDate: Date | null;
  cycleDurationDays: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  members?: TontineMember[];
  cycles?: Cycle[];
  creator?: User;
}

export interface TontineMember {
  id: string;
  tontineId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  leftAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  tontine?: Tontine;
}

export interface CreateTontineInput {
  name: string;
  description?: string;
  type: TontineType;
  contributionAmount: number;
  currency: string;
  contributionFrequency: ContributionFrequency;
  maxMembers: number;
  startDate: Date;
  endDate?: Date;
  cycleDurationDays: number;
  createdById: string;
}

export interface UpdateTontineInput {
  name?: string;
  description?: string;
  status?: TontineStatus;
  contributionAmount?: number;
  maxMembers?: number;
  endDate?: Date;
  cycleDurationDays?: number;
}
