import { z } from "zod";
export declare const CreateDisputeDto: z.ZodObject<{
    tontineId: z.ZodString;
    cycleId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    contributionId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    type: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    tontineId: string;
    description: string;
    cycleId?: string | null | undefined;
    contributionId?: string | null | undefined;
}, {
    type: string;
    tontineId: string;
    description: string;
    cycleId?: string | null | undefined;
    contributionId?: string | null | undefined;
}>;
export declare const OpenDisputeDto: z.ZodObject<{
    tontineId: z.ZodString;
    cycleId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    contributionId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    type: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    tontineId: string;
    description: string;
    cycleId?: string | null | undefined;
    contributionId?: string | null | undefined;
}, {
    type: string;
    tontineId: string;
    description: string;
    cycleId?: string | null | undefined;
    contributionId?: string | null | undefined;
}>;
export declare const ResolveDisputeDto: z.ZodObject<{
    decision: z.ZodString;
}, "strip", z.ZodTypeAny, {
    decision: string;
}, {
    decision: string;
}>;
export type CreateDisputeInput = z.infer<typeof CreateDisputeDto>;
export type ResolveDisputeInput = z.infer<typeof ResolveDisputeDto>;
//# sourceMappingURL=disputes.dto.d.ts.map