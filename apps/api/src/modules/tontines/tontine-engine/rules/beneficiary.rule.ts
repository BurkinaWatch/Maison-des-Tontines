import { EngineRule } from "../types.js";

export class BeneficiaryRule implements EngineRule {
  name = "BeneficiaryRule";

  isApplicable(context: any): boolean {
    return context.cycleSequence > 0 && !!context.beneficiaryOrder;
  }

  async apply(context: any): Promise<void> {
    const index = (context.cycleSequence - 1) % context.beneficiaryOrder.length;
    context.selectedBeneficiaryId = context.beneficiaryOrder[index];
  }
}
