import { z } from 'zod';

export const emailSchema = z.string().email('Email invalide');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide');
export const amountSchema = z.number().positive('Le montant doit être positif');
export const currencySchema = z.string().length(3, 'Devise invalide (3 caractères requis)');
export const dateSchema = z.coerce.date();

export const createUserSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  firstName: z.string().min(2, 'Prénom trop court').max(50),
  lastName: z.string().min(2, 'Nom trop court').max(50),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().length(2, 'Code pays invalide'),
});

export const createTontineSchema = z.object({
  name: z.string().min(3, 'Nom trop court').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['ROTATING', 'SAVINGS', 'LOTTERY', 'CUSTOM']),
  contributionAmount: amountSchema,
  currency: currencySchema,
  contributionFrequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM']),
  maxMembers: z.number().int().min(3).max(50),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  cycleDurationDays: z.number().int().positive(),
});

export const createContributionSchema = z.object({
  amount: amountSchema,
  notes: z.string().max(500).optional(),
});

export const createDisputeSchema = z.object({
  type: z.enum(['MISSING_PAYMENT', 'LATE_PAYMENT', 'RULE_VIOLATION', 'MEMBER_CONFLICT', 'TECHNICAL_ISSUE', 'OTHER']),
  title: z.string().min(5, 'Titre trop court').max(200),
  description: z.string().min(10, 'Description trop courte').max(2000),
  evidence: z.array(z.string().url()).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateTontineInput = z.infer<typeof createTontineSchema>;
export type CreateContributionInput = z.infer<typeof createContributionSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
