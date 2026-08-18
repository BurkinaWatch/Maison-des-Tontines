import { z } from "zod";

export const OpenDisputeDto = z.object({
  tontineId: z.string(),
  cycleId: z.string().optional().nullable(),
  contributionId: z.string().optional().nullable(),
  type: z.string().min(3, "Type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const ResolveDisputeDto = z.object({
  decision: z.string().min(10, "Decision must be at least 10 characters"),
});

export type OpenDisputeInput = z.infer<typeof OpenDisputeDto>;
export type ResolveDisputeInput = z.infer<typeof ResolveDisputeDto>;
