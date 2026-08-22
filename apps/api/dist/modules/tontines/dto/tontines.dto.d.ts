import { z } from "zod";
export declare const CreateTontineDto: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    type: z.ZodEnum<["ROTATIVE", "SAVINGS", "GOAL", "HYBRID", "CUSTOM"]>;
    currency: z.ZodDefault<z.ZodString>;
    contributionAmount: z.ZodNumber;
    frequency: z.ZodEnum<["daily", "weekly", "biweekly", "monthly", "bimonthly", "quarterly", "semesterly", "yearly"]>;
    startDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>>;
    maxMembers: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type: "ROTATIVE" | "SAVINGS" | "GOAL" | "HYBRID" | "CUSTOM";
    frequency: "daily" | "weekly" | "biweekly" | "monthly" | "bimonthly" | "quarterly" | "semesterly" | "yearly";
    name: string;
    contributionAmount: number;
    currency: string;
    startDate: string | Date;
    rules?: Record<string, string> | undefined;
    description?: string | null | undefined;
    endDate?: string | Date | null | undefined;
    maxMembers?: number | null | undefined;
}, {
    type: "ROTATIVE" | "SAVINGS" | "GOAL" | "HYBRID" | "CUSTOM";
    frequency: "daily" | "weekly" | "biweekly" | "monthly" | "bimonthly" | "quarterly" | "semesterly" | "yearly";
    name: string;
    contributionAmount: number;
    startDate: string | Date;
    rules?: Record<string, string> | undefined;
    description?: string | null | undefined;
    currency?: string | undefined;
    endDate?: string | Date | null | undefined;
    maxMembers?: number | null | undefined;
}>;
export declare const UpdateTontineDto: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "INVITING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED", "DISPUTED"]>>;
    maxMembers: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "DRAFT" | "INVITING" | "PAUSED" | "COMPLETED" | "CANCELLED" | "DISPUTED" | undefined;
    name?: string | undefined;
    rules?: Record<string, string> | undefined;
    description?: string | null | undefined;
    maxMembers?: number | null | undefined;
}, {
    status?: "ACTIVE" | "DRAFT" | "INVITING" | "PAUSED" | "COMPLETED" | "CANCELLED" | "DISPUTED" | undefined;
    name?: string | undefined;
    rules?: Record<string, string> | undefined;
    description?: string | null | undefined;
    maxMembers?: number | null | undefined;
}>;
export type CreateTontineInput = z.infer<typeof CreateTontineDto>;
export type UpdateTontineInput = z.infer<typeof UpdateTontineDto>;
//# sourceMappingURL=tontines.dto.d.ts.map