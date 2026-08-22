import { EngineRule } from "../types.js";
export interface RotationContext {
    tontineId: string;
    members: Array<{
        id: string;
        payoutOrder: number | null;
    }>;
    rules: Record<string, unknown>;
    selectedBeneficiaryId: string | null;
    rotationType: string;
}
export declare class RotationRule implements EngineRule {
    name: string;
    isApplicable(context: RotationContext): boolean;
    apply(context: RotationContext): Promise<void>;
}
//# sourceMappingURL=rotation.rule.d.ts.map