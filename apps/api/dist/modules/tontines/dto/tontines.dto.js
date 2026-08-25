import { z } from "zod";
export const CreateTontineDto = z.object({
    name: z.string().min(2).max(255),
    description: z.string().optional().nullable(),
    type: z.enum(["ROTATIVE", "SAVINGS", "GOAL", "HYBRID", "CUSTOM"]),
    currency: z.string().length(3).default("XOF"),
    contributionAmount: z.number().positive(),
    frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "bimonthly", "quarterly", "semesterly", "yearly"]),
    startDate: z.string().datetime().or(z.coerce.date()),
    endDate: z.string().datetime().or(z.coerce.date()).optional().nullable(),
    maxMembers: z.number().int().positive().optional().nullable(),
    rules: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
}).superRefine((data, ctx) => {
    const requiredByType = {
        ROTATIVE: ["payoutOrder"],
        SAVINGS: ["savingsTarget", "savingsTargetDate"],
        GOAL: ["investmentProject", "investmentTarget", "investmentRisk"],
        HYBRID: ["socialAidType", "socialBeneficiary", "socialUrgency"],
    };
    for (const key of requiredByType[data.type] ?? []) {
        const value = data.rules?.[key];
        if (value === undefined || value === "") {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["rules", key], message: `${key} is required for this tontine type` });
        }
    }
});
export const UpdateTontineDto = z.object({
    name: z.string().min(2).max(255).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(["DRAFT", "INVITING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED", "DISPUTED"]).optional(),
    maxMembers: z.number().int().positive().optional().nullable(),
    rules: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});
//# sourceMappingURL=tontines.dto.js.map