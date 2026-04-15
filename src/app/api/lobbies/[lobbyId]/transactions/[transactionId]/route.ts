import { lobbyTransactionsController } from "@/controllers/lobby-transactions.controller";
import { withObservedRequest } from "@/utils/observability";

type LobbyTransactionRouteContext = {
  params: Promise<{ lobbyId: string; transactionId: string }>;
};

export async function GET(req: Request, context: LobbyTransactionRouteContext) {
  const { lobbyId, transactionId } = await context.params;
  return withObservedRequest("api.lobbyTransactions.getById", req, () =>
    lobbyTransactionsController.getById(lobbyId, transactionId),
  );
}

export async function PATCH(req: Request, context: LobbyTransactionRouteContext) {
  const { lobbyId, transactionId } = await context.params;
  return withObservedRequest("api.lobbyTransactions.update", req, () =>
    lobbyTransactionsController.update(req, lobbyId, transactionId),
  );
}

export async function DELETE(req: Request, context: LobbyTransactionRouteContext) {
  const { lobbyId, transactionId } = await context.params;
  return withObservedRequest("api.lobbyTransactions.delete", req, () =>
    lobbyTransactionsController.remove(lobbyId, transactionId),
  );
}
