import { z } from "zod";

export const createTransactionSchema = z.object({
  accountId: z.string().min(1),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  amount: z.number().int().positive(),
  description: z.string().max(200).optional(),
  date: z.string().min(1), // ISO string
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
