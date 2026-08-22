import { z } from "zod";

export const RequestOtpDto = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),
});

export const RegisterDto = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),
  email: z.string().email().optional().nullable(),
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  otp: z.string().length(6, "OTP must be 6 digits").optional(),
}).refine((data) => Boolean(data.password || data.otp), {
  message: "A password or verification code is required",
});

export const VerifyOtpDto = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const LoginDto = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),
  password: z.string().min(1, "Password is required"),
});

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const ResendOtpDto = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenDto>;
export type ResendOtpInput = z.infer<typeof ResendOtpDto>;
