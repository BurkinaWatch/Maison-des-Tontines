import { TontineEngine } from "./engine.service.js";
export declare class CycleService {
    private engine;
    constructor(engine: TontineEngine);
    createCycles(tontineId: string, frequency: string, startDate: Date, memberCount: number): Promise<{
        tontineId: string;
        sequence: number;
        name: string;
        startDate: Date;
        status: "UPCOMING";
    }[]>;
    advanceCycle(tontineId: string, cycleId: string): Promise<{
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
    }>;
    completeCycle(tontineId: string, cycleId: string): Promise<{
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
    }>;
    private checkTontineCompletion;
}
//# sourceMappingURL=cycle.service.d.ts.map