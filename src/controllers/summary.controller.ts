import { getMonthRange } from "@/lib/date/monthRange";
import { authService } from "@/server/services/auth.service";
import { summaryService } from "@/server/services/summary.service";
import { monthSchema } from "@/validators/transaction.validator";
import { fail, ok } from "@/utils/api-response";

export const summaryController = {
  async getMonthly(req: Request) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { searchParams } = new URL(req.url);
      const rawMonth = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
      const month = monthSchema.parse(rawMonth);
      const { start, end } = getMonthRange(month);
      const summary = await summaryService.monthly(user.id, start, end);
      return ok(summary);
    } catch (error) {
      return fail(error);
    }
  },
};
