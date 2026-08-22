export declare class CyclesService {
    getTontineCycles(tontineId: string): Promise<({
        payouts: ({
            member: {
                user: {
                    id: string;
                    name: string;
                    phone: string;
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
        })[];
        contributions: ({
            member: {
                user: {
                    id: string;
                    name: string;
                    phone: string;
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
        })[];
        beneficiary: ({
            user: {
                id: string;
                name: string;
                phone: string;
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
        }) | null;
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
    })[]>;
}
export declare const cyclesService: CyclesService;
//# sourceMappingURL=cycles.service.d.ts.map