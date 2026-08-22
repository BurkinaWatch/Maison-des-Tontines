import { EngineRule } from "../types.js";
export declare class BeneficiaryRule implements EngineRule {
    name: string;
    isApplicable(context: any): boolean;
    apply(context: any): Promise<void>;
}
//# sourceMappingURL=beneficiary.rule.d.ts.map