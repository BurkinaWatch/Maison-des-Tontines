export class TontineEngine {
    rules = [];
    constructor(rules = []) {
        this.rules = rules;
    }
    setRules(rules) {
        this.rules = rules;
    }
    addRule(rule) {
        this.rules.push(rule);
    }
    removeRule(ruleName) {
        this.rules = this.rules.filter((r) => r.name !== ruleName);
    }
    getRules() {
        return this.rules.map((r) => r.name);
    }
    async calculateCycleData(tontineId, cycleSequence, tontineRules, contributionAmount = 0) {
        const rulesConfig = {};
        for (const rule of tontineRules) {
            rulesConfig[rule.key] = rule.type === "NUMBER" ? parseFloat(rule.value) : rule.value;
        }
        const context = {
            tontineId,
            cycleSequence,
            rules: { ...rulesConfig, contributionAmount },
            latePenaltyAmount: 0,
            beneficiaryOrder: [],
        };
        for (const rule of this.rules) {
            if (rule.isApplicable(context)) {
                await rule.apply(context);
            }
        }
        return context;
    }
    async getBeneficiaryOrder(members, rotationType = "fixed") {
        if (rotationType === "fixed") {
            return [...members].sort((a, b) => (a.payoutOrder || 0) - (b.payoutOrder || 0)).map((m) => m.id);
        }
        else if (rotationType === "random") {
            return [...members].sort(() => Math.random() - 0.5).map((m) => m.id);
        }
        return members.map((m) => m.id);
    }
    async selectBeneficiary(beneficiaryOrder, cycleSequence) {
        if (beneficiaryOrder.length === 0)
            return null;
        const index = (cycleSequence - 1) % beneficiaryOrder.length;
        return beneficiaryOrder[index];
    }
    async calculateLatePenalty(contributionAmount, lateDays, penaltyRate = 0.05, maxPenalty = 0) {
        const calculatedPenalty = contributionAmount * penaltyRate;
        if (maxPenalty > 0) {
            return Math.min(calculatedPenalty, maxPenalty);
        }
        return calculatedPenalty;
    }
}
//# sourceMappingURL=engine.service.js.map