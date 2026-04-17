import { z } from "zod";

export const monthSchema = z
  .string()
  .regex(
    /^\d{4}-(0[1-9]|1[0-2])$/,
    "Invalid month format. Expected YYYY-MM.",
  );

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE", "TRANSFER"]);
export const monthStartSchema = z.enum(["1", "25"]);
export const pageSchema = z.coerce.number().int().min(1);
export const limitSchema = z.coerce.number().int().min(1).max(200);

export const listTransactionsQuerySchema = z.object({
  month: monthSchema.optional(),
  monthStart: monthStartSchema.optional(),
  type: transactionTypeSchema.optional(),
  page: pageSchema.optional(),
  limit: limitSchema.optional(),
});

const dateStringSchema = z
  .string()
  .datetime()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Invalid date",
  });

const createTransactionBaseSchema = z.object({
  accountId: z.string().min(1),
  toAccountId: z.string().min(1).optional(),
  type: transactionTypeSchema,
  category: z.string().min(1).max(80),
  amount: z.number().int().positive(),
  description: z.string().max(200).optional(),
  date: dateStringSchema,
});

export const createTransactionSchema = createTransactionBaseSchema.superRefine(
  (value, ctx) => {
    if (value.type === "TRANSFER") {
      if (!value.toAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["toAccountId"],
          message: "toAccountId is required for TRANSFER",
        });
      }
      return;
    }

    if (value.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toAccountId"],
        message: "toAccountId is only allowed for TRANSFER",
      });
    }
  },
);

export const transactionIdParamSchema = z.object({
  transactionId: z.string().min(1),
});

export const updateTransactionSchema = z
  .object({
    accountId: z.string().min(1).optional(),
    toAccountId: z.union([z.string().min(1), z.null()]).optional(),
    type: transactionTypeSchema.optional(),
    category: z.string().min(1).max(80).optional(),
    amount: z.number().int().positive().optional(),
    description: z.union([z.string().max(200), z.null()]).optional(),
    date: dateStringSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field is required",
      });
      return;
    }

    const nextType = value.type;
    const nextToAccountId = value.toAccountId;

    if (nextType === "TRANSFER" && !nextToAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toAccountId"],
        message: "toAccountId is required for TRANSFER",
      });
    }

    if (
      typeof nextType !== "undefined" &&
      nextType !== "TRANSFER" &&
      typeof nextToAccountId !== "undefined" &&
      nextToAccountId !== null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toAccountId"],
        message: "toAccountId is only allowed for TRANSFER",
      });
    }
  });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
