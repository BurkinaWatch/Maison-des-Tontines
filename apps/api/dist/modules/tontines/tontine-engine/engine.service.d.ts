import { EngineRule, CycleContext, TontineRule } from "./types.js";
export declare class TontineEngine {
    private rules;
    constructor(rules?: EngineRule[]);
    setRules(rules: EngineRule[]): void;
    addRule(rule: EngineRule): void;
    removeRule(ruleName: string): void;
    getRules(): string[];
    calculateCycleData(tontineId: string, cycleSequence: number, tontineRules: TontineRule[], contributionAmount?: number): Promise<CycleContext>;
    getBeneficiaryOrder(members: Array<{
        id: string;
        payoutOrder: number | null;
    }>, rotationType?: string): Promise<string[]>;
    selectBeneficiary(beneficiaryOrder: string[], cycleSequence: number): Promise<string | null>;
    calculateLatePenalty(contributionAmount: number, lateDays: number, penaltyRate?: number, maxPenalty?: number): Promise<number>;
}
//# sourceMappingURL=engine.service.d.ts.map