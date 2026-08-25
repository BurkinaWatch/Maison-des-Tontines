import { Currency } from "./contribution";
import { CreateTontineRequest } from "./api";

export type { Currency, CreateTontineRequest };

export type TontineType = "rotating" | "savings" | "investment" | "social";
export type TontineStatus = "draft" | "active" | "completed" | "suspended";
export type CycleStatus = "upcoming" | "current" | "completed" | "skipped";
export type ContributionStatus = "pending" | "paid" | "late" | "missed";
export type PayoutStatus = "pending" | "processing" | "completed" | "failed";
export type DisputeStatus = "open" | "under_review" | "resolved" | "closed";

export interface Tontine {
  id: string;
  name: string;
  description: string;
  type: TontineType;
  status: TontineStatus;
  amount: number;
  currency: Currency;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly";
  totalMembers: number;
  currentCycle: number;
  totalCycles: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  createdBy: string;
  members: TontineMember[];
  rules: TontineRules;
}

export interface TontineMember {
  id: string;
  userId: string;
  tontineId: string;
  name: string;
  phoneNumber: string;
  avatarUrl?: string;
  position: number;
  payoutOrder: number | number[];
  joinedAt: string;
  role?: "MEMBER" | "TREASURER" | "ADMIN" | "ORGANIZER";
  status?: "ACTIVE" | "INVITED" | "DECLINED" | "INACTIVE";
  email?: string;
  contributions?: { status: string; amount: number; cycleId: string }[];
}

export interface MembershipInvitation {
  id: string;
  tontineId: string;
  status: "INVITED";
  joinedAt: string;
  tontine: { id: string; name: string; currency: string; contributionAmount: number };
}

export interface TontineRules {
  allowLatePayment: boolean;
  latePenaltyPercent: number;
  requireVoteForAbsent: boolean;
  maxMissedContributions: number;
  payoutDelayDays: number;
  allowEarlyPayout: boolean;
  earlyPayoutPenalty: number;
}

export interface Cycle {
  id: string;
  tontineId: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  status: CycleStatus;
  potAmount: number;
  payoutRecipientId?: string;
  completedAt?: string;
  contributions?: { status: string; amount: number; memberId: string }[];
}
