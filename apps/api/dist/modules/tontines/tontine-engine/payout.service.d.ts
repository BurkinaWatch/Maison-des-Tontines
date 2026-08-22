import { TontineEngine } from "./engine.service.js";
export declare class PayoutService {
    private engine;
    constructor(engine: TontineEngine);
    initiatePayout(tontineId: string, cycleId: string, memberId: string, amount: number): Promise<any>;
    completePayout(payoutId: string): Promise<any>;
    failPayout(payoutId: string, reason: string): Promise<any>;
}
//# sourceMappingURL=payout.service.d.ts.map