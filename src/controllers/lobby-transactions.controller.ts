import { authService } from "@/server/services/auth.service";
import { lobbyTransactionService } from "@/server/services/lobby-transaction.service";
import { fail, ok } from "@/utils/api-response";
import {
  createLobbyTransactionSchema,
  listLobbyTransactionsQuerySchema,
  lobbyTransactionIdParamSchema,
  updateLobbyTransactionSchema,
} from "@/validators/lobby-transaction.validator";
import { lobbyIdParamSchema } from "@/validators/lobby.validator";

function parseSearchParams(url: string) {
  const { searchParams } = new URL(url);
  return listLobbyTransactionsQuerySchema.parse({
    month: searchParams.get("month") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
}

export const lobbyTransactionsController = {
  async getMany(req: Request, lobbyId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { lobbyId: parsedLobbyId } = lobbyIdParamSchema.parse({ lobbyId });
      const query = parseSearchParams(req.url);
      const transactions = await lobbyTransactionService.list({
        userId: user.id,
        lobbyId: parsedLobbyId,
        month: query.month,
        type: query.type,
        page: query.page,
        limit: query.limit,
      });
      return ok({ transactions });
    } catch (error) {
      return fail(error);
    }
  },

  async getById(lobbyId: string, transactionId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const {
        lobbyId: parsedLobbyId,
        transactionId: parsedTransactionId,
      } = lobbyTransactionIdParamSchema.parse({
        lobbyId,
        transactionId,
      });
      const transaction = await lobbyTransactionService.findByIdAndLobbyId(
        user.id,
        parsedLobbyId,
        parsedTransactionId,
      );
      return ok({ transaction });
    } catch (error) {
      return fail(error);
    }
  },

  async create(req: Request, lobbyId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { lobbyId: parsedLobbyId } = lobbyIdParamSchema.parse({ lobbyId });
      const body = await req.json();
      const parsed = createLobbyTransactionSchema.parse(body);
      const transaction = await lobbyTransactionService.create(user.id, parsedLobbyId, {
        memberId: parsed.memberId,
        type: parsed.type,
        category: parsed.category,
        amount: parsed.amount,
        description: parsed.description,
        date: new Date(parsed.date),
      });
      return ok({ transaction }, 201);
    } catch (error) {
      return fail(error);
    }
  },

  async update(req: Request, lobbyId: string, transactionId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const {
        lobbyId: parsedLobbyId,
        transactionId: parsedTransactionId,
      } = lobbyTransactionIdParamSchema.parse({
        lobbyId,
        transactionId,
      });
      const body = await req.json();
      const parsed = updateLobbyTransactionSchema.parse(body);
      const transaction = await lobbyTransactionService.update(
        user.id,
        parsedLobbyId,
        parsedTransactionId,
        {
          memberId: parsed.memberId,
          type: parsed.type,
          category: parsed.category,
          amount: parsed.amount,
          description: parsed.description,
          date: parsed.date ? new Date(parsed.date) : undefined,
        },
      );
      return ok({ transaction });
    } catch (error) {
      return fail(error);
    }
  },

  async remove(lobbyId: string, transactionId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const {
        lobbyId: parsedLobbyId,
        transactionId: parsedTransactionId,
      } = lobbyTransactionIdParamSchema.parse({
        lobbyId,
        transactionId,
      });
      const transaction = await lobbyTransactionService.delete(
        user.id,
        parsedLobbyId,
        parsedTransactionId,
      );
      return ok({ transaction });
    } catch (error) {
      return fail(error);
    }
  },
};
