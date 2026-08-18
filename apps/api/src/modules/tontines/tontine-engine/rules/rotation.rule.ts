import { EngineRule } from "../types.js";

export interface RotationContext {
  tontineId: string;
  members: Array<{ id: string; payoutOrder: number | null }>;
  selectedBeneficiaryId: string | null;
  rotationType: string;
}

export class RotationRule implements EngineRule {
  name = "RotationRule";

  isApplicable(context: RotationContext): boolean {
    return true;
  }

  async apply(context: RotationContext): Promise<void> {
    const rotationType = context.rules.rotationType || "fixed";
    context.rotationType = rotationType;

    if (rotationType === "fixed" && context.members.length > 0) {
      const sortedMembers = [...context.members].sort(
        (a, b) => (a.payoutOrder || 0) - (b.payoutOrder || 0)
      );
      context.selectedBeneficiaryId = sortedMembers[0]?.id || null;
    } else if (rotationType === "random") {
      const randomIndex = Math.floor(Math.random() * context.members.length);
      context.selectedBeneficiaryId = context.members[randomIndex]?.id || null;
    } else if (rotationType === "voted") {
      context.selectedBeneficiaryId = null;
    }
  }
}
