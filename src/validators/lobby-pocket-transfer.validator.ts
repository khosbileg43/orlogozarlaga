import { z } from "zod";

const isoDateSchema = z
  .string()
  .datetime()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Invalid date",
  });

export const transferFromPocketSchema = z.object({
  accountId: z.string().min(1),
  memberId: z.string().min(1),
  amount: z.number().int().positive(),
  description: z.string().trim().max(200).nullish(),
  date: isoDateSchema,
});

export type TransferFromPocketInput = z.infer<typeof transferFromPocketSchema>;
