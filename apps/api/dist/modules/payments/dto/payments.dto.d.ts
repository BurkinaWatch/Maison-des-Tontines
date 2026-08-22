import { z } from "zod";
export declare const InitiatePaymentDto: z.ZodObject<{
    tontineId: z.ZodString;
    cycleId: z.ZodString;
    amount: z.ZodNumber;
    phoneNumber: z.ZodString;
    method: z.ZodDefault<z.ZodEnum<["MOBILE_MONEY", "CASH", "BANK_TRANSFER"]>>;
}, "strip", z.ZodTypeAny, {
    tontineId: string;
    cycleId: string;
    amount: number;
    method: "MOBILE_MONEY" | "CASH" | "BANK_TRANSFER";
    phoneNumber: string;
}, {
    tontineId: string;
    cycleId: string;
    amount: number;
    phoneNumber: string;
    method?: "MOBILE_MONEY" | "CASH" | "BANK_TRANSFER" | undefined;
}>;
export declare const InitiatePayoutDto: z.ZodObject<{
    tontineId: z.ZodString;
    cycleId: z.ZodString;
    memberId: z.ZodString;
    amount: z.ZodNumber;
    method: z.ZodDefault<z.ZodEnum<["MOBILE_MONEY", "CASH", "BANK_TRANSFER"]>>;
    phoneNumber: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tontineId: string;
    memberId: string;
    cycleId: string;
    amount: number;
    method: "MOBILE_MONEY" | "CASH" | "BANK_TRANSFER";
    phoneNumber: string;
}, {
    tontineId: string;
    memberId: string;
    cycleId: string;
    amount: number;
    phoneNumber: string;
    method?: "MOBILE_MONEY" | "CASH" | "BANK_TRANSFER" | undefined;
}>;
export type InitiatePaymentInput = z.infer<typeof InitiatePaymentDto>;
export type InitiatePayoutInput = z.infer<typeof InitiatePayoutDto>;
//# sourceMappingURL=payments.dto.d.ts.map