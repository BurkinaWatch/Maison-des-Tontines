import { z } from "zod";
export declare const CreateCycleDto: z.ZodObject<{
    tontineId: z.ZodString;
    sequence: z.ZodNumber;
    name: z.ZodString;
    startDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    startDate: string | Date;
    tontineId: string;
    sequence: number;
    endDate?: string | Date | null | undefined;
}, {
    name: string;
    startDate: string | Date;
    tontineId: string;
    sequence: number;
    endDate?: string | Date | null | undefined;
}>;
export type CreateCycleInput = z.infer<typeof CreateCycleDto>;
//# sourceMappingURL=cycles.dto.d.ts.map