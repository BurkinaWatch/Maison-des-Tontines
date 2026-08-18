import { EngineRule, CycleContext, TontineRule } from "./types.js";

export class TontineEngine {
  private rules: EngineRule[] = [];

  constructor(rules: EngineRule[] = []) {
    this.rules = rules;
  }

  setRules(rules: EngineRule[]) {
    this.rules = rules;
  }

  addRule(rule: EngineRule) {
    this.rules.push(rule);
  }

  removeRule(ruleName: string) {
    this.rules = this.rules.filter((r) => r.name !== ruleName);
  }

  getRules(): string[] {
    return this.rules.map((r) => r.name);
  }

  async calculateCycleData(
    tontineId: string,
    cycleSequence: number,
    tontineRules: TontineRule[],
    contributionAmount: number = 0
  ): Promise<CycleContext> {
    const rulesConfig: Record<string, any> = {};
    for (const rule of tontineRules) {
      rulesConfig[rule.key] = rule.type === "NUMBER" ? parseFloat(rule.value) : rule.value;
    }

    const context: CycleContext = {
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

  async getBeneficiaryOrder(members: Array<{ id: string; payoutOrder: number | null }>, rotationType: string = "fixed"): Promise<string[]> {
    if (rotationType === "fixed") {
      return [...members].sort((a, b) => (a.payoutOrder || 0) - (b.payoutOrder || 0)).map((m) => m.id);
    } else if (rotationType === "random") {
      return [...members].sort(() => Math.random() - 0.5).map((m) => m.id);
    }
    return members.map((m) => m.id);
  }

  async selectBeneficiary(beneficiaryOrder: string[], cycleSequence: number): Promise<string | null> {
    if (beneficiaryOrder.length === 0) return null;
    const index = (cycleSequence - 1) % beneficiaryOrder.length;
    return beneficiaryOrder[index];
  }

  async calculateLatePenalty(
    contributionAmount: number,
    lateDays: number,
    penaltyRate: number = 0.05,
    maxPenalty: number = 0
  ): Promise<number> {
    const calculatedPenalty = contributionAmount * penaltyRate;
    if (maxPenalty > 0) {
      return Math.min(calculatedPenalty, maxPenalty);
    }
    return calculatedPenalty;
  }
}
