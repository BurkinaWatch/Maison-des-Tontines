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

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const amountSchema = z
  .number()
  .positive("Amount must be greater than 0")
  .max(100000000, "Amount is too large");

const normalizeCurrencyCode = (value: unknown) => {
  if (typeof value !== "string") return value;
  const currency = value.trim().toUpperCase().replace(/\s+/g, " ");
  return ["FCFA", "F CFA", "CFA"].includes(currency) ? "XOF" : currency;
};

export const currencyCodeSchema = z.preprocess(
  normalizeCurrencyCode,
  z.string().regex(/^[A-Z]{3}$/, "Choose a currency from the list.")
);

export const parseTontineAmount = (value: string): number => {
  const normalized = value
    .trim()
    .replace(/[\s\u00a0\u202f]/g, "")
    .replace(",", ".");
  return normalized ? Number(normalized) : Number.NaN;
};

export const getTontineCategoryError = (
  type: "rotating" | "savings" | "investment" | "social",
  details: Record<string, unknown>
): string | null => {
  if (type === "savings") {
    if (!Number.isFinite(parseTontineAmount(String(details.savingsTarget ?? ""))) ||
      parseTontineAmount(String(details.savingsTarget ?? "")) <= 0) {
      return "Enter a positive savings target.";
    }
    const targetDate = String(details.savingsTargetDate ?? "");
    const parsedDate = new Date(`${targetDate}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== targetDate) {
      return "Enter the target date in YYYY-MM-DD format.";
    }
  }

  if (type === "investment") {
    if (!String(details.investmentProject ?? "").trim()) {
      return "Enter the investment project.";
    }
    if (!Number.isFinite(parseTontineAmount(String(details.investmentTarget ?? ""))) ||
      parseTontineAmount(String(details.investmentTarget ?? "")) <= 0) {
      return "Enter a positive investment target.";
    }
    if (!["low", "medium", "high"].includes(String(details.investmentRisk))) {
      return "Choose an investment risk level.";
    }
  }

  if (type === "social") {
    if (!String(details.socialAidType ?? "").trim()) {
      return "Enter the type of aid.";
    }
    if (!String(details.socialBeneficiary ?? "").trim()) {
      return "Enter the beneficiary.";
    }
    if (!["low", "normal", "urgent"].includes(String(details.socialUrgency))) {
      return "Choose an urgency level.";
    }
  }

  return null;
};

export const tontineNameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(100, "Name must be less than 100 characters");

export const descriptionSchema = z
  .string()
  .max(500, "Description must be less than 500 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  phoneNumber: phoneSchema,
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  password: passwordSchema,
});

export const createTontineSchema = z.object({
  name: tontineNameSchema,
  description: descriptionSchema,
  type: z.enum(["rotating", "savings", "investment", "social"]),
  amount: amountSchema,
  currency: currencyCodeSchema,
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
