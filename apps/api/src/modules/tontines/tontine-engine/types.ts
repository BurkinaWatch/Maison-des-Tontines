import { TontineEngine } from "./engine.service.js";
import { TontineRule, CycleService, EngineRule, LatePenaltyRule } from "./types.js";

export class EngineService {
  private rules: EngineRule[] = [];
  private prisma: any;

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

  async calculateCycleData(tontineId: string, cycleSequence: number, tontineRules: TontineRule[]) {
    const rulesConfig: Record<string, any> = {};
    for (const rule of tontineRules) {
      rulesConfig[rule.key] = rule.type === "NUMBER" ? parseFloat(rule.value) : rule.value;
    }

    const context = {
      tontineId,
      cycleSequence,
      rules: rulesConfig,
      latePenaltyAmount: 0,
      beneficiaryOrder: [] as string[],
    };

    for (const rule of this.rules) {
      if (rule.isApplicable(context)) {
        await rule.apply(context);
      }
    }

    return context;
  }

  async getBeneficiaryOrder(tontineId: string, members: Array<{ id: string; payoutOrder: number | null }>) {
    const context = {
      tontineId,
      members,
      selectedBeneficiaryId: null as string | null,
      rotationType: "fixed",
    };

    const rotationRule = this.rules.find((r) => r.name === "RotationRule");
    if (rotationRule) {
      await rotationRule.apply(context);
    }

    return context.selectedBeneficiaryId;
  }

  async calculateLatePenalty(contributionAmount: number, lateDays: number, penaltyRate: number = 0.05): Promise<number> {
    const context = {
      contributionAmount,
      lateDays,
      penaltyRate,
      calculatedPenalty: 0,
    };

    const latePenaltyRule = this.rules.find((r) => r.name === "LatePenaltyRule");
    if (latePenaltyRule) {
      await latePenaltyRule.apply(context);
    }

    return context.calculatedPenalty;
  }
}

export interface EngineRule {
  name: string;
  isApplicable(context: any): boolean;
  apply(context: any): Promise<void>;
}

export interface TontineRule {
  id: string;
  tontineId: string;
  key: string;
  value: string;
  type: string;
}

export interface CycleContext {
  tontineId: string;
  cycleSequence: number;
  rules: Record<string, any>;
  latePenaltyAmount: number;
  beneficiaryOrder: string[];
}
