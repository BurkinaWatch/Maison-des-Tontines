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
