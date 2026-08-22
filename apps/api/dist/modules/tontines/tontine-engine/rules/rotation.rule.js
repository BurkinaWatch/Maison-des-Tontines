export class RotationRule {
    name = "RotationRule";
    isApplicable(context) {
        return true;
    }
    async apply(context) {
        const configuredRotationType = context.rules.rotationType;
        const rotationType = typeof configuredRotationType === "string" ? configuredRotationType : "fixed";
        context.rotationType = rotationType;
        if (rotationType === "fixed" && context.members.length > 0) {
            const sortedMembers = [...context.members].sort((a, b) => (a.payoutOrder || 0) - (b.payoutOrder || 0));
            context.selectedBeneficiaryId = sortedMembers[0]?.id || null;
        }
        else if (rotationType === "random") {
            const randomIndex = Math.floor(Math.random() * context.members.length);
            context.selectedBeneficiaryId = context.members[randomIndex]?.id || null;
        }
        else if (rotationType === "voted") {
            context.selectedBeneficiaryId = null;
        }
    }
}
//# sourceMappingURL=rotation.rule.js.map