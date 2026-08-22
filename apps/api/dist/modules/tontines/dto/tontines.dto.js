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
    rules: z.record(z.string(), z.string()).optional(),
});
export const UpdateTontineDto = z.object({
    name: z.string().min(2).max(255).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(["DRAFT", "INVITING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED", "DISPUTED"]).optional(),
    maxMembers: z.number().int().positive().optional().nullable(),
    rules: z.record(z.string(), z.string()).optional(),
});
//# sourceMappingURL=tontines.dto.js.map