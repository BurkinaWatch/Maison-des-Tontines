import { describe, expect, it } from "vitest";
import { CreateTontineDto } from "../../src/modules/tontines/dto/tontines.dto.js";

const validRotatingTontine = {
  name: "Team tontine",
  type: "ROTATIVE" as const,
  contributionAmount: 35000,
  frequency: "monthly" as const,
  startDate: "2026-12-01T00:00:00.000Z",
  maxMembers: 5,
  rules: { payoutOrder: "organizer-first" },
};

const validTontinesByType = [
  {
    label: "rotating",
    input: {
      ...validRotatingTontine,
      type: "ROTATIVE" as const,
      rules: { payoutOrder: "organizer-first", totalCycles: 5 },
    },
  },
  {
    label: "savings",
    input: {
      ...validRotatingTontine,
      type: "SAVINGS" as const,
      rules: {
        savingsTarget: 500000,
        savingsTargetDate: "2027-06-30",
        allowEarlyWithdrawal: false,
        totalCycles: 5,
      },
    },
  },
  {
    label: "investment",
    input: {
      ...validRotatingTontine,
      type: "GOAL" as const,
      rules: {
        investmentProject: "Community shop",
        investmentTarget: 2000000,
        investmentRisk: "medium",
        investmentDuration: "12",
        profitSharing: "Pro-rata to contributions",
        totalCycles: 5,
      },
    },
  },
  {
    label: "social",
    input: {
      ...validRotatingTontine,
      type: "HYBRID" as const,
      rules: {
        socialAidType: "emergency",
        socialBeneficiary: "Awa",
        socialUrgency: "normal",
        socialTarget: 300000,
        totalCycles: 5,
      },
    },
  },
];

describe("CreateTontineDto type validation", () => {
  it.each(validTontinesByType)("accepts a complete $label tontine", ({ input }) => {
    const result = CreateTontineDto.safeParse({
      ...input,
      currency: "XOF",
      description: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe(input.type);
      expect(result.data.rules).toEqual(input.rules);
    }
  });

  it.each([
    ["SAVINGS", { savingsTargetDate: "2027-06-30" }],
    ["GOAL", { investmentProject: "Community shop" }],
    ["HYBRID", { socialBeneficiary: "Awa", socialUrgency: "normal" }],
  ] as const)("rejects incomplete %s-specific settings", (type, rules) => {
    const result = CreateTontineDto.safeParse({
      ...validRotatingTontine,
      type,
      rules,
      currency: "XOF",
    });

    expect(result.success).toBe(false);
  });
});

describe("CreateTontineDto currency validation", () => {
  it.each([
    ["XOF", "XOF"],
    ["xof", "XOF"],
    [" FCFA ", "XOF"],
    ["F CFA", "XOF"],
  ])("normalizes %s to %s", (input, expected) => {
    const result = CreateTontineDto.safeParse({
      ...validRotatingTontine,
      currency: input,
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.currency).toBe(expected);
  });

  it("defaults an omitted currency to XOF", () => {
    const result = CreateTontineDto.safeParse(validRotatingTontine);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.currency).toBe("XOF");
  });

  it("returns a clear currency-code message for an invalid value", () => {
    const result = CreateTontineDto.safeParse({
      ...validRotatingTontine,
      currency: "5000",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Choose a valid currency code.");
    }
  });
});
