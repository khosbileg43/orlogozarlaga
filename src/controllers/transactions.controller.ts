import { getMonthRange } from "@/lib/date/monthRange";
import { authService } from "@/server/services/auth.service";
import { transactionService } from "@/server/services/transaction.service";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  transactionIdParamSchema,
  updateTransactionSchema,
} from "@/validators/transaction.validator";
import { fail, ok } from "@/utils/api-response";

function parseSearchParams(url: string) {
  const { searchParams } = new URL(url);
  return listTransactionsQuerySchema.parse({
    month: searchParams.get("month") ?? undefined,
    type: searchParams.get("type") ?? undefined,
  });
}

export const transactionsController = {
  async getMany(req: Request) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const query = parseSearchParams(req.url);
      const month = query.month ?? new Date().toISOString().slice(0, 7);
      const { start, end } = getMonthRange(month);

      const transactions = await transactionService.list({
        userId: user.id,
        start,
        end,
        type: query.type,
      });

      return ok({ transactions });
    } catch (error) {
      return fail(error);
    }
  },

  async create(req: Request) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const body = await req.json();
      const parsed = createTransactionSchema.parse(body);

      const created = await transactionService.create(user.id, {
        accountId: parsed.accountId,
        type: parsed.type,
        category: parsed.category,
        amount: parsed.amount,
        description: parsed.description,
        date: new Date(parsed.date),
      });

      return ok({ transaction: created }, 201);
    } catch (error) {
      return fail(error);
    }
  },

  async getById(transactionId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { transactionId: parsedId } = transactionIdParamSchema.parse({
        transactionId,
      });
      const transaction = await transactionService.findByIdAndUserId(
        user.id,
        parsedId,
      );

      return ok({ transaction });
    } catch (error) {
      return fail(error);
    }
  },

  async update(req: Request, transactionId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { transactionId: parsedId } = transactionIdParamSchema.parse({
        transactionId,
      });
      const body = await req.json();
      const parsed = updateTransactionSchema.parse(body);

      const updated = await transactionService.update(user.id, parsedId, {
        category: parsed.category,
        description: parsed.description,
        date: parsed.date ? new Date(parsed.date) : undefined,
      });

      return ok({ transaction: updated });
    } catch (error) {
      return fail(error);
    }
  },

  async remove(transactionId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { transactionId: parsedId } = transactionIdParamSchema.parse({
        transactionId,
      });
      const deleted = await transactionService.delete(user.id, parsedId);

      return ok({ transaction: deleted });
    } catch (error) {
      return fail(error);
    }
  },
};
