import { TontineEngine } from "./engine.service.js";
export declare class PayoutService {
    private engine;
    constructor(engine: TontineEngine);
    initiatePayout(tontineId: string, cycleId: string, memberId: string, amount: number): Promise<{
        tontine: {
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
        cycle: {
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
        tontineId: string;
        cycleId: string;
        memberId: string;
        amount: number;
        method: string;
        providerRef: string | null;
        initiatedAt: Date;
        completedAt: Date | null;
        failureReason: string | null;
    }>;
    completePayout(payoutId: string): Promise<{
        status: string;
        id: string;
        tontineId: string;
        cycleId: string;
        memberId: string;
        amount: number;
        method: string;
        providerRef: string | null;
        initiatedAt: Date;
        completedAt: Date | null;
        failureReason: string | null;
    }>;
    failPayout(payoutId: string, reason: string): Promise<{
        status: string;
        id: string;
        tontineId: string;
        cycleId: string;
        memberId: string;
        amount: number;
        method: string;
        providerRef: string | null;
        initiatedAt: Date;
        completedAt: Date | null;
        failureReason: string | null;
    }>;
}
//# sourceMappingURL=payout.service.d.ts.map