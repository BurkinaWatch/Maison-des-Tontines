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
    advanceCycle(tontineId: string, cycleId: string): Promise<any>;
    completeCycle(tontineId: string, cycleId: string): Promise<any>;
    private checkTontineCompletion;
}
//# sourceMappingURL=cycle.service.d.ts.map