import { z } from "zod";
const normalizedPhone = z
    .string()
    .trim()
    .transform((value) => value.replace(/[^\d+]/g, ""))
    .refine((value) => /^\+?\d{8,15}$/.test(value), "Enter a valid phone number.");
const cardNumber = z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => /^\d{12,19}$/.test(value), "Enter a valid card number.");
export const CreatePaymentMethodDto = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("MOBILE_MONEY"),
        label: z.string().trim().min(2).max(80),
        provider: z.string().trim().min(2).max(40),
        phone: normalizedPhone,
    }),
    z.object({
        type: z.literal("CARD"),
        label: z.string().trim().min(2).max(80),
        cardBrand: z.string().trim().min(2).max(30),
        cardNumber,
    }),
]);
//# sourceMappingURL=payment-method.dto.js.map