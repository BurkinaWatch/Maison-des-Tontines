import { z } from "zod";
export const InitiatePaymentDto = z.object({
    tontineId: z.string(),
    cycleId: z.string(),
    amount: z.number().positive().optional(),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),
    method: z.enum(["MOBILE_MONEY", "CASH", "BANK_TRANSFER"]).default("MOBILE_MONEY"),
});
export const InitiatePayoutDto = z.object({
    tontineId: z.string(),
    cycleId: z.string(),
    memberId: z.string(),
    amount: z.number().positive(),
    method: z.enum(["MOBILE_MONEY", "CASH", "BANK_TRANSFER"]).default("MOBILE_MONEY"),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),
});
//# sourceMappingURL=payments.dto.js.map