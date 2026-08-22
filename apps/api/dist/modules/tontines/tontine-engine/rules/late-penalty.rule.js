export class LatePenaltyRule {
    name = "LatePenaltyRule";
    isApplicable(context) {
        return context.latePenaltyAmount === 0;
    }
    async apply(context) {
        const penaltyRate = context.rules.latePenaltyRate ?? 0.05;
        const maxPenalty = context.rules.maxLatePenalty ?? context.rules.contributionAmount * 0.5;
        const contributionAmount = context.rules.contributionAmount || 0;
        const calculatedPenalty = contributionAmount * penaltyRate;
        context.latePenaltyAmount = Math.min(calculatedPenalty, maxPenalty);
    }
}
//# sourceMappingURL=late-penalty.rule.js.map