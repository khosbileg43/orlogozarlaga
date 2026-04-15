import { z } from "zod";
import { monthSchema } from "./transaction.validator";

export const lobbySummaryQuerySchema = z.object({
  month: monthSchema.optional(),
});
