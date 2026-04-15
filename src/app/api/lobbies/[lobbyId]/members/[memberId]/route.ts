import { lobbyMembersController } from "@/controllers/lobby-members.controller";
import { withObservedRequest } from "@/utils/observability";

type LobbyMemberRouteContext = {
  params: Promise<{ lobbyId: string; memberId: string }>;
};

export async function DELETE(req: Request, context: LobbyMemberRouteContext) {
  const { lobbyId, memberId } = await context.params;
  return withObservedRequest("api.lobbyMembers.delete", req, () =>
    lobbyMembersController.remove(lobbyId, memberId),
  );
}
