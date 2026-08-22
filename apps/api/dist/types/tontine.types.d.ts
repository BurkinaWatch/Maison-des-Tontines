export interface TontineSummary {
    id: string;
    name: string;
    type: string;
    status: string;
    contributionAmount: number;
    currency: string;
    frequency: string;
    startDate: Date;
    endDate: Date | null;
    memberCount: number;
    currentCycle: number | null;
}
export interface TontineMemberSummary {
    id: string;
    userId: string;
    name: string;
    phone: string;
    role: string;
    status: string;
    joinedAt: Date;
    payoutOrder: number | null;
    isPayoutReceived: boolean;
}
export interface CycleSummary {
    id: string;
    sequence: number;
    name: string;
    status: string;
    startDate: Date;
    endDate: Date | null;
    beneficiaryName: string | null;
    potAmount: number | null;
    potReceived: number | null;
    contributionCount: number;
}
export interface ContributionSummary {
    id: string;
    memberId: string;
    memberName: string;
    amount: number;
    status: string;
    declaredAt: Date;
    confirmedAt: Date | null;
    lateFee: number;
    penaltyApplied: boolean;
}
export interface PaymentSummary {
    id: string;
    amount: number;
    status: string;
    method: string;
    providerRef: string | null;
    initiatedAt: Date;
    completedAt: Date | null;
    failureReason: string | null;
}
//# sourceMappingURL=tontine.types.d.ts.map