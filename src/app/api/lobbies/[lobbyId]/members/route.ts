import { lobbyMembersController } from "@/controllers/lobby-members.controller";
import { withObservedRequest } from "@/utils/observability";

type LobbyMembersRouteContext = {
  params: Promise<{ lobbyId: string }>;
};

export async function GET(req: Request, context: LobbyMembersRouteContext) {
  const { lobbyId } = await context.params;
  return withObservedRequest("api.lobbyMembers.list", req, () =>
    lobbyMembersController.getMany(lobbyId),
  );
}

export async function POST(req: Request, context: LobbyMembersRouteContext) {
  const { lobbyId } = await context.params;
  return withObservedRequest("api.lobbyMembers.create", req, () =>
    lobbyMembersController.create(req, lobbyId),
  );
}
