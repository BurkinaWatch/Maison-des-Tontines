import { CycleContext } from "../types.js";
export declare class LatePenaltyRule {
    name: string;
    isApplicable(context: CycleContext): boolean;
    apply(context: CycleContext): Promise<void>;
}
//# sourceMappingURL=late-penalty.rule.d.ts.map