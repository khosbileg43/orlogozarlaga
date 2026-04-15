import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().trim().min(1).max(60),
  balance: z.number().int().min(0).default(0),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
