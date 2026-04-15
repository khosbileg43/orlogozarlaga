import { lobbySummaryController } from "@/controllers/lobby-summary.controller";
import { withObservedRequest } from "@/utils/observability";

type LobbyMemberSummaryRouteContext = {
  params: Promise<{ lobbyId: string }>;
};

export async function GET(req: Request, context: LobbyMemberSummaryRouteContext) {
  const { lobbyId } = await context.params;
  return withObservedRequest("api.lobbySummary.member", req, () =>
    lobbySummaryController.getMemberSummary(req, lobbyId),
  );
}
