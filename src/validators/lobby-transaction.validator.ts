import { z } from "zod";
import {
  limitSchema,
  monthSchema,
  pageSchema,
} from "./transaction.validator";

const lobbyTransactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

const dateStringSchema = z
  .string()
  .datetime()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Invalid date",
  });

export const listLobbyTransactionsQuerySchema = z.object({
  month: monthSchema.optional(),
  type: lobbyTransactionTypeSchema.optional(),
  page: pageSchema.optional(),
  limit: limitSchema.optional(),
});

export const lobbyTransactionIdParamSchema = z.object({
  lobbyId: z.string().min(1),
  transactionId: z.string().min(1),
});

export const createLobbyTransactionSchema = z.object({
  memberId: z.string().min(1),
  type: lobbyTransactionTypeSchema,
  category: z.string().trim().min(1).max(80),
  amount: z.number().int().positive(),
  description: z.string().trim().max(200).nullish(),
  date: dateStringSchema,
});

export const updateLobbyTransactionSchema = z
  .object({
    memberId: z.string().min(1).optional(),
    type: lobbyTransactionTypeSchema.optional(),
    category: z.string().trim().min(1).max(80).optional(),
    amount: z.number().int().positive().optional(),
    description: z.string().trim().max(200).nullable().optional(),
    date: dateStringSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });
