import { z } from "zod";

export const monthSchema = z
  .string()
  .regex(
    /^\d{4}-(0[1-9]|1[0-2])$/,
    "Invalid month format. Expected YYYY-MM.",
  );

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

export const listTransactionsQuerySchema = z.object({
  month: monthSchema.optional(),
  type: transactionTypeSchema.optional(),
});

const dateStringSchema = z
  .string()
  .datetime()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Invalid date",
  });

export const createTransactionSchema = z.object({
  accountId: z.string().min(1),
  type: transactionTypeSchema,
  category: z.string().min(1).max(80),
  amount: z.number().int().positive(),
  description: z.string().max(200).optional(),
  date: dateStringSchema,
});

export const transactionIdParamSchema = z.object({
  transactionId: z.string().min(1),
});

export const updateTransactionSchema = createTransactionSchema
  .omit({ accountId: true, type: true, amount: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
