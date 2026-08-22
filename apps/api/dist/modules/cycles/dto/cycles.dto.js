import { z } from "zod";
export const CreateCycleDto = z.object({
    tontineId: z.string(),
    sequence: z.number().int().positive(),
    name: z.string().min(1),
    startDate: z.string().datetime().or(z.coerce.date()),
    endDate: z.string().datetime().or(z.coerce.date()).optional().nullable(),
});
//# sourceMappingURL=cycles.dto.js.map