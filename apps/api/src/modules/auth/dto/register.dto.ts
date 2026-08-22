import { z } from "zod";

export const RequestOtpDto = z.object({
  email: z.string().email("Invalid email address"),
});

export const RegisterDto = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const VerifyOtpDto = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const LoginDto = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),
  password: z.string().min(1, "Password is required"),
});

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const ResendOtpDto = z.object({
  email: z.string().email("Invalid email address"),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
export type RequestOtpInput = z.infer<typeof RequestOtpDto>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenDto>;
export type ResendOtpInput = z.infer<typeof ResendOtpDto>;
