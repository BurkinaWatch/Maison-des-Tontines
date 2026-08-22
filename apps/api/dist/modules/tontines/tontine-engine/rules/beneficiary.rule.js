export class BeneficiaryRule {
    name = "BeneficiaryRule";
    isApplicable(context) {
        return context.cycleSequence > 0 && !!context.beneficiaryOrder;
    }
    async apply(context) {
        const index = (context.cycleSequence - 1) % context.beneficiaryOrder.length;
        context.selectedBeneficiaryId = context.beneficiaryOrder[index];
    }
}
//# sourceMappingURL=beneficiary.rule.js.map