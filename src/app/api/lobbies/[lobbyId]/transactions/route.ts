import { lobbyTransactionsController } from "@/controllers/lobby-transactions.controller";
import { withObservedRequest } from "@/utils/observability";

type LobbyTransactionsRouteContext = {
  params: Promise<{ lobbyId: string }>;
};

export async function GET(req: Request, context: LobbyTransactionsRouteContext) {
  const { lobbyId } = await context.params;
  return withObservedRequest("api.lobbyTransactions.list", req, () =>
    lobbyTransactionsController.getMany(req, lobbyId),
  );
}

export async function POST(req: Request, context: LobbyTransactionsRouteContext) {
  const { lobbyId } = await context.params;
  return withObservedRequest("api.lobbyTransactions.create", req, () =>
    lobbyTransactionsController.create(req, lobbyId),
  );
}
