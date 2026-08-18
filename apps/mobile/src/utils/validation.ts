import { z } from "zod";

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^(\+?[0-9]{10,15})$/, "Invalid phone number format");

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[a-zA-Z\s\-']+$/, "Name contains invalid characters");

export const otpSchema = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^[0-9]+$/, "OTP must contain only numbers");

export const amountSchema = z
  .number()
  .positive("Amount must be greater than 0")
  .max(100000000, "Amount is too large");

export const tontineNameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(100, "Name must be less than 100 characters");

export const descriptionSchema = z
  .string()
  .min(10, "Description must be at least 10 characters")
  .max(500, "Description must be less than 500 characters");

export const loginSchema = z.object({
  phoneNumber: phoneSchema,
  otp: otpSchema,
});

export const registerSchema = z.object({
  phoneNumber: phoneSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  otp: otpSchema,
});

export const createTontineSchema = z.object({
  name: tontineNameSchema,
  description: descriptionSchema,
  type: z.enum(["rotating", "savings", "investment", "social"]),
  amount: amountSchema,
  currency: z.string().length(3),
  frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly"]),
  totalMembers: z.number().int().min(2).max(50),
  totalCycles: z.number().int().min(1).max(100),
  startDate: z.string().min(1, "Start date is required"),
  rules: z.object({
    allowLatePayment: z.boolean(),
    latePenaltyPercent: z.number().min(0).max(100),
    requireVoteForAbsent: z.boolean(),
    maxMissedContributions: z.number().int().min(0).max(5),
    payoutDelayDays: z.number().int().min(0).max(30),
    allowEarlyPayout: z.boolean(),
    earlyPayoutPenalty: z.number().min(0).max(100),
  }),
  members: z
    .array(
      z.object({
        phoneNumber: phoneSchema,
        name: nameSchema,
        position: z.number().int().min(1),
      })
    )
    .min(2, "At least 2 members required")
    .max(50, "Maximum 50 members allowed"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateTontineInput = z.infer<typeof createTontineSchema>;
