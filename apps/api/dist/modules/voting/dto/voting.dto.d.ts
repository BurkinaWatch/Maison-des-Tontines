import { z } from "zod";
export declare const CreateVoteDto: z.ZodObject<{
    tontineId: z.ZodString;
    question: z.ZodString;
    options: z.ZodArray<z.ZodString, "many">;
    quorum: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    options: string[];
    tontineId: string;
    question: string;
    quorum: number;
}, {
    options: string[];
    tontineId: string;
    question: string;
    quorum?: number | undefined;
}>;
export declare const CastVoteDto: z.ZodObject<{
    voteId: z.ZodString;
    choice: z.ZodString;
}, "strip", z.ZodTypeAny, {
    voteId: string;
    choice: string;
}, {
    voteId: string;
    choice: string;
}>;
export type CreateVoteInput = z.infer<typeof CreateVoteDto>;
export type CastVoteInput = z.infer<typeof CastVoteDto>;
//# sourceMappingURL=voting.dto.d.ts.map