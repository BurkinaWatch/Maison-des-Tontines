import { TontineEngine } from "./tontine-engine/engine.service.js";
export declare class TontinesService {
    private engine;
    constructor(engine: TontineEngine);
    createTontine(data: any, userId: string): Promise<{
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
    }>;
    getTontines(userId: string, filters: any): Promise<({
        _count: {
            members: number;
        };
        members: {
            status: string;
            id: string;
            tontineId: string;
            userId: string;
            role: string;
            joinedAt: Date;
            leftAt: Date | null;
            payoutOrder: number | null;
            isPayoutReceived: boolean;
        }[];
        cycles: {
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
    })[]>;
    getTontineById(id: string, userId: string): Promise<({
        votes: {
            options: string;
            status: string;
            result: string | null;
            id: string;
            tontineId: string;
            createdById: string;
            openedAt: Date | null;
            question: string;
            quorum: number;
            eligibleVoterIds: string;
            closedAt: Date | null;
        }[];
        rules: {
            value: string;
            type: string;
            id: string;
            tontineId: string;
            key: string;
        }[];
        members: ({
            user: {
                id: string;
                name: string;
                phone: string;
                email: string | null;
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
        })[];
        cycles: {
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
    }) | null>;
    updateTontine(id: string, data: any): Promise<{
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
    }>;
    addMember(tontineId: string, userId: string, role?: string): Promise<{
        status: string;
        id: string;
        tontineId: string;
        userId: string;
        role: string;
        joinedAt: Date;
        leftAt: Date | null;
        payoutOrder: number | null;
        isPayoutReceived: boolean;
    }>;
}
export declare const tontinesService: TontinesService;
//# sourceMappingURL=tontines.service.d.ts.map