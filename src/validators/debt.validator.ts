import { z } from "zod";

const dateStringSchema = z
  .string()
  .datetime()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Invalid date",
  });

const debtDirectionSchema = z.enum(["I_OWE", "OWES_ME"]);
const debtStatusSchema = z.enum(["OPEN", "SETTLED", "CANCELLED"]);
const debtCategorySchema = z.enum([
  "FAMILY",
  "FRIENDS",
  "WORK",
  "EMERGENCY",
  "BUSINESS",
  "OTHER",
]);
const debtEventTypeSchema = z.enum(["REPAYMENT", "ADDITIONAL", "NOTE"]);

export const debtIdParamSchema = z.object({
  debtId: z.string().min(1),
});

export const createDebtSchema = z.object({
  personName: z.string().trim().min(1).max(120),
  direction: debtDirectionSchema,
  category: debtCategorySchema,
  reason: z.string().trim().min(1).max(200),
  note: z.string().trim().max(1000).nullish(),
  openedAt: dateStringSchema,
  dueDate: dateStringSchema.nullish(),
  amount: z.number().int().positive(),
  counterpartyUserId: z.string().min(1).nullish(),
});

export const updateDebtSchema = z
  .object({
    personName: z.string().trim().min(1).max(120).optional(),
    direction: debtDirectionSchema.optional(),
    category: debtCategorySchema.optional(),
    reason: z.string().trim().min(1).max(200).optional(),
    note: z.string().trim().max(1000).nullable().optional(),
    openedAt: dateStringSchema.optional(),
    dueDate: dateStringSchema.nullish(),
    amount: z.number().int().positive().optional(),
    status: debtStatusSchema.optional(),
    counterpartyUserId: z.string().min(1).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const createDebtEventSchema = z.object({
  type: debtEventTypeSchema,
  amount: z.number().int().nonnegative(),
  note: z.string().trim().max(1000).nullish(),
  eventDate: dateStringSchema,
});

export type CreateDebtInput = z.infer<typeof createDebtSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;
export type CreateDebtEventInput = z.infer<typeof createDebtEventSchema>;
