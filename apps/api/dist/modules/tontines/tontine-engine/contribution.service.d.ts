import { TontineEngine } from "./engine.service.js";
export declare class ContributionService {
    private engine;
    private latePenaltyRule;
    constructor(engine: TontineEngine, latePenaltyRule: any);
    recordContribution(tontineId: string, cycleId: string, memberId: string, amount: number, method?: string, providerRef?: string): Promise<{
        cycle: {
            tontine: {
                rules: {
                    value: string;
                    type: string;
                    id: string;
                    tontineId: string;
                    key: string;
                }[];
            } & {
                type: string;
                status: string;
                frequency: string;
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                currency: string;
                contributionAmount: number;
                startDate: Date;
                endDate: Date | null;
                maxMembers: number | null;
                createdById: string;
            };
        } & {
            status: string;
            id: string;
            tontineId: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            sequence: number;
            startDate: Date;
            endDate: Date | null;
            beneficiaryMemberId: string | null;
            potAmount: number | null;
            potReceived: number | null;
        };
        member: {
            user: {
                status: string;
                id: string;
                role: string;
                name: string;
                phone: string;
                email: string | null;
                passwordHash: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            status: string;
            id: string;
            tontineId: string;
            userId: string;
            role: string;
            joinedAt: Date;
            leftAt: Date | null;
            payoutOrder: number | null;
            isPayoutReceived: boolean;
        };
    } & {
        status: string;
        id: string;
        cycleId: string;
        memberId: string;
        amount: number;
        method: string;
        providerRef: string | null;
        declaredAt: Date;
        confirmedAt: Date | null;
        confirmedById: string | null;
        lateFee: number;
        penaltyApplied: boolean;
        notes: string | null;
    }>;
    markLate(contributionId: string, lateDays: number): Promise<{
        status: string;
        id: string;
        cycleId: string;
        memberId: string;
        amount: number;
        method: string;
        providerRef: string | null;
        declaredAt: Date;
        confirmedAt: Date | null;
        confirmedById: string | null;
        lateFee: number;
        penaltyApplied: boolean;
        notes: string | null;
    }>;
    validateContribution(tontineId: string, cycleId: string, memberId: string, amount: number): Promise<{
        valid: boolean;
        membership: {
            status: string;
            id: string;
            tontineId: string;
            userId: string;
            role: string;
            joinedAt: Date;
            leftAt: Date | null;
            payoutOrder: number | null;
            isPayoutReceived: boolean;
        };
    }>;
    private updateTrustProfile;
}
//# sourceMappingURL=contribution.service.d.ts.map