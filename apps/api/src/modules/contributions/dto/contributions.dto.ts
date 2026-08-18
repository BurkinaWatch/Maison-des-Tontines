import { z } from "zod";

export const RecordContributionDto = z.object({
  cycleId: z.string(),
  amount: z.number().positive(),
  method: z.string().default("MANUAL"),
  providerRef: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type RecordContributionInput = z.infer<typeof RecordContributionDto>;
