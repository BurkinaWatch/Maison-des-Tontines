import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Response } from "express";

const prismaMocks = vi.hoisted(() => ({
  tontineCreate: vi.fn(),
  tontineFindFirst: vi.fn(),
  memberCreate: vi.fn(),
}));

vi.mock("../../src/config/database.js", () => ({
  getPrisma: () => ({
    tontine: {
      create: prismaMocks.tontineCreate,
      findFirst: prismaMocks.tontineFindFirst,
    },
    tontineMember: { create: prismaMocks.memberCreate },
  }),
}));

import { TontinesController } from "../../src/modules/tontines/tontines.controller.js";

const rulesByType = [
  {
    type: "ROTATIVE",
    rules: { payoutOrder: "organizer-first", totalCycles: 5 },
  },
  {
    type: "SAVINGS",
    rules: {
      savingsTarget: 500000,
      savingsTargetDate: "2027-06-30",
      allowEarlyWithdrawal: false,
      totalCycles: 5,
    },
  },
  {
    type: "GOAL",
    rules: {
      investmentProject: "Community shop",
      investmentTarget: 2000000,
      investmentRisk: "medium",
      investmentDuration: "12",
      profitSharing: "Pro-rata to contributions",
      totalCycles: 5,
    },
  },
  {
    type: "HYBRID",
    rules: {
      socialAidType: "emergency",
      socialBeneficiary: "Awa",
      socialUrgency: "normal",
      socialTarget: 300000,
      totalCycles: 5,
    },
  },
];

function makeResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe("TontinesController rule persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMocks.memberCreate.mockResolvedValue({});
  });

  it.each(rulesByType)("persists and returns every $type rule", async ({ type, rules }) => {
    const storedRules = Object.entries(rules).map(([key, value]) => ({
      id: `rule-${key}`,
      key,
      value: String(value),
      type: typeof value === "number" ? "NUMBER" : typeof value === "boolean" ? "BOOLEAN" : "STRING",
    }));
    const tontine = {
      id: "tontine-1",
      name: "Team tontine",
      type,
      rules: storedRules,
    };
    prismaMocks.tontineCreate.mockResolvedValueOnce(tontine);
    prismaMocks.tontineFindFirst.mockResolvedValueOnce(tontine);

    const createResponse = makeResponse();
    const next = vi.fn();
    const controller = new TontinesController();
    await controller.createTontine(
      {
        userId: "user-1",
        body: {
          name: tontine.name,
          type,
          contributionAmount: 35000,
          currency: "XOF",
          frequency: "monthly",
          startDate: "2026-12-01T00:00:00.000Z",
          rules,
        },
      },
      createResponse,
      next,
    );

    expect(next).not.toHaveBeenCalled();
    const createArgs = prismaMocks.tontineCreate.mock.calls[0][0];
    expect(createArgs.data.rules.create).toEqual(
      Object.entries(rules).map(([key, value]) => ({
        key,
        value: String(value),
        type: typeof value === "number" ? "NUMBER" : typeof value === "boolean" ? "BOOLEAN" : "STRING",
      })),
    );
    expect(createArgs.include.rules).toBe(true);
    expect(createResponse.status).toHaveBeenCalledWith(201);
    expect(createResponse.json).toHaveBeenCalledWith({ tontine });

    const readResponse = makeResponse();
    await controller.getTontine(
      { userId: "user-1", params: { id: tontine.id } },
      readResponse,
      next,
    );

    expect(prismaMocks.tontineFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: tontine.id, members: { some: { userId: "user-1", status: "ACTIVE" } } },
        include: expect.objectContaining({ rules: true }),
      }),
    );
    expect(readResponse.json).toHaveBeenCalledWith({ tontine });
  });
});
