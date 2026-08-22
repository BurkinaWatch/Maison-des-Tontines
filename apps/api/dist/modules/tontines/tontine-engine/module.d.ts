import { TontineEngine } from "./engine.service.js";
import { CycleService } from "./cycle.service.js";
import { ContributionService } from "./contribution.service.js";
import { PayoutService } from "./payout.service.js";
export declare class TontineEngineModule {
    private engine;
    private cycleService;
    private contributionService;
    private payoutService;
    constructor();
    getEngine(): TontineEngine;
    getCycleService(): CycleService;
    getContributionService(): ContributionService;
    getPayoutService(): PayoutService;
}
export declare const tontineEngineModule: TontineEngineModule;
//# sourceMappingURL=module.d.ts.map