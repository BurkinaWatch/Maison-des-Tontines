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
  beneficiaryId?: string | null;
  selectedBeneficiaryId?: string | null;
  members?: Array<{ id: string; payoutOrder: number | null }>;
  rotationType?: string;
  contributionAmount?: number;
  lateDays?: number;
  penaltyRate?: number;
  calculatedPenalty?: number;
}
