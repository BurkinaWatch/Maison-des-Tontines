import { z } from "zod";

export const CreateVoteDto = z.object({
  tontineId: z.string(),
  question: z.string().min(5, "Question must be at least 5 characters"),
  options: z.array(z.string()).min(2, "At least 2 options are required"),
  quorum: z.number().int().min(0).default(0),
});

export const CastVoteDto = z.object({
  voteId: z.string(),
  choice: z.string().min(1, "Choice is required"),
});

export type CreateVoteInput = z.infer<typeof CreateVoteDto>;
export type CastVoteInput = z.infer<typeof CastVoteDto>;
