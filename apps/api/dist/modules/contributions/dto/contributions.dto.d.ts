import { z } from "zod";
export declare const RecordContributionDto: z.ZodObject<{
    cycleId: z.ZodString;
    amount: z.ZodNumber;
    method: z.ZodDefault<z.ZodString>;
    providerRef: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    cycleId: string;
    amount: number;
    method: string;
    providerRef?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    cycleId: string;
    amount: number;
    method?: string | undefined;
    providerRef?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export type RecordContributionInput = z.infer<typeof RecordContributionDto>;
//# sourceMappingURL=contributions.dto.d.ts.map