import { z } from "zod";
export declare const CreateCycleDto: z.ZodObject<{
    tontineId: z.ZodString;
    sequence: z.ZodNumber;
    name: z.ZodString;
    startDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
}, "strip", z.ZodTypeAny, {
    tontineId: string;
    name: string;
    sequence: number;
    startDate: string | Date;
    endDate?: string | Date | null | undefined;
}, {
    tontineId: string;
    name: string;
    sequence: number;
    startDate: string | Date;
    endDate?: string | Date | null | undefined;
}>;
export type CreateCycleInput = z.infer<typeof CreateCycleDto>;
//# sourceMappingURL=cycles.dto.d.ts.map