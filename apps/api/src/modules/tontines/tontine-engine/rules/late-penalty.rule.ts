import { CycleContext } from "../types.js";

export class LatePenaltyRule {
  name = "LatePenaltyRule";

  isApplicable(context: CycleContext): boolean {
    return context.latePenaltyAmount === 0;
  }

  async apply(context: CycleContext): Promise<void> {
    const penaltyRate = context.rules.latePenaltyRate ?? 0.05;
    const maxPenalty = context.rules.maxLatePenalty ?? context.rules.contributionAmount * 0.5;

    const contributionAmount = context.rules.contributionAmount || 0;
    const calculatedPenalty = contributionAmount * penaltyRate;

    context.latePenaltyAmount = Math.min(calculatedPenalty, maxPenalty);
  }
}
