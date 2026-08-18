import { TontineEngine } from "./engine.service.js";
import { CycleService } from "./cycle.service.js";
import { ContributionService } from "./contribution.service.js";
import { PayoutService } from "./payout.service.js";
import { LatePenaltyRule } from "./rules/late-penalty.rule.js";
import { RotationRule } from "./rules/rotation.rule.js";
import { BeneficiaryRule } from "./rules/beneficiary.rule.js";

export class TontineEngineModule {
  private engine: TontineEngine;
  private cycleService: CycleService;
  private contributionService: ContributionService;
  private payoutService: PayoutService;

  constructor() {
    const latePenaltyRule = new LatePenaltyRule();
    const rotationRule = new RotationRule();
    const beneficiaryRule = new BeneficiaryRule();

    this.engine = new TontineEngine([rotationRule, beneficiaryRule, latePenaltyRule]);
    this.cycleService = new CycleService(this.engine);
    this.contributionService = new ContributionService(this.engine, latePenaltyRule);
    this.payoutService = new PayoutService(this.engine);
  }

  getEngine(): TontineEngine {
    return this.engine;
  }

  getCycleService(): CycleService {
    return this.cycleService;
  }

  getContributionService(): ContributionService {
    return this.contributionService;
  }

  getPayoutService(): PayoutService {
    return this.payoutService;
  }
}

export const tontineEngineModule = new TontineEngineModule();
