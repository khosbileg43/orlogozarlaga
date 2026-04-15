import { lobbiesController } from "@/controllers/lobbies.controller";
import { withObservedRequest } from "@/utils/observability";

type LobbyRouteContext = {
  params: Promise<{ lobbyId: string }>;
};

export async function GET(req: Request, context: LobbyRouteContext) {
  const { lobbyId } = await context.params;
  return withObservedRequest("api.lobbies.getById", req, () =>
    lobbiesController.getById(lobbyId),
  );
}

export async function PATCH(req: Request, context: LobbyRouteContext) {
  const { lobbyId } = await context.params;
  return withObservedRequest("api.lobbies.update", req, () =>
    lobbiesController.update(req, lobbyId),
  );
}

export async function DELETE(req: Request, context: LobbyRouteContext) {
  const { lobbyId } = await context.params;
  return withObservedRequest("api.lobbies.delete", req, () =>
    lobbiesController.remove(lobbyId),
  );
}
