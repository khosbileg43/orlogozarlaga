import { lobbyPocketTransfersController } from "@/controllers/lobby-pocket-transfers.controller";
import { withObservedRequest } from "@/utils/observability";

type LobbyTransferFromPocketRouteContext = {
  params: Promise<{ lobbyId: string }>;
};

export async function POST(
  req: Request,
  context: LobbyTransferFromPocketRouteContext,
) {
  const { lobbyId } = await context.params;
  return withObservedRequest("api.lobbyPocketTransfers.create", req, () =>
    lobbyPocketTransfersController.create(req, lobbyId),
  );
}
