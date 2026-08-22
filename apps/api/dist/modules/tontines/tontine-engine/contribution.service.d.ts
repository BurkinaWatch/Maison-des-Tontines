import { TontineEngine } from "./engine.service.js";
export declare class ContributionService {
    private engine;
    private latePenaltyRule;
    constructor(engine: TontineEngine, latePenaltyRule: any);
    recordContribution(tontineId: string, cycleId: string, memberId: string, amount: number, method?: string, providerRef?: string): Promise<any>;
    markLate(contributionId: string, lateDays: number): Promise<any>;
    validateContribution(tontineId: string, cycleId: string, memberId: string, amount: number): Promise<{
        valid: boolean;
        membership: any;
    }>;
    private updateTrustProfile;
}
//# sourceMappingURL=contribution.service.d.ts.map