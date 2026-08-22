import { z } from "zod";
export declare const RequestOtpDto: z.ZodObject<{
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
}, {
    phone: string;
}>;
export declare const RegisterDto: z.ZodEffects<z.ZodObject<{
    phone: z.ZodString;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    name: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
    otp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    name: string;
    email?: string | null | undefined;
    password?: string | undefined;
    otp?: string | undefined;
}, {
    phone: string;
    name: string;
    email?: string | null | undefined;
    password?: string | undefined;
    otp?: string | undefined;
}>, {
    phone: string;
    name: string;
    email?: string | null | undefined;
    password?: string | undefined;
    otp?: string | undefined;
}, {
    phone: string;
    name: string;
    email?: string | null | undefined;
    password?: string | undefined;
    otp?: string | undefined;
}>;
export declare const VerifyOtpDto: z.ZodObject<{
    phone: z.ZodString;
    otp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    otp: string;
}, {
    phone: string;
    otp: string;
}>;
export declare const LoginDto: z.ZodObject<{
    phone: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    password: string;
}, {
    phone: string;
    password: string;
}>;
export declare const RefreshTokenDto: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const ResendOtpDto: z.ZodObject<{
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
}, {
    phone: string;
}>;
export type RegisterInput = z.infer<typeof RegisterDto>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenDto>;
export type ResendOtpInput = z.infer<typeof ResendOtpDto>;
//# sourceMappingURL=register.dto.d.ts.map