import { lobbySummaryController } from "@/controllers/lobby-summary.controller";
import { withObservedRequest } from "@/utils/observability";

type LobbySummaryRouteContext = {
  params: Promise<{ lobbyId: string }>;
};

export async function GET(req: Request, context: LobbySummaryRouteContext) {
  const { lobbyId } = await context.params;
  return withObservedRequest("api.lobbySummary.get", req, () =>
    lobbySummaryController.getSummary(req, lobbyId),
  );
}
