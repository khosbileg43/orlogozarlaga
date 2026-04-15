import { authService } from "@/server/services/auth.service";
import { lobbySummaryService } from "@/server/services/lobby-summary.service";
import { fail, ok } from "@/utils/api-response";
import { lobbySummaryQuerySchema } from "@/validators/lobby-summary.validator";
import { lobbyIdParamSchema } from "@/validators/lobby.validator";

function parseSearchParams(url: string) {
  const { searchParams } = new URL(url);
  return lobbySummaryQuerySchema.parse({
    month: searchParams.get("month") ?? undefined,
  });
}

export const lobbySummaryController = {
  async getSummary(req: Request, lobbyId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { lobbyId: parsedLobbyId } = lobbyIdParamSchema.parse({ lobbyId });
      const query = parseSearchParams(req.url);
      const summary = await lobbySummaryService.getSummary({
        userId: user.id,
        lobbyId: parsedLobbyId,
        month: query.month,
      });
      return ok({ summary });
    } catch (error) {
      return fail(error);
    }
  },

  async getMemberSummary(req: Request, lobbyId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { lobbyId: parsedLobbyId } = lobbyIdParamSchema.parse({ lobbyId });
      const query = parseSearchParams(req.url);
      const members = await lobbySummaryService.getMemberSummary({
        userId: user.id,
        lobbyId: parsedLobbyId,
        month: query.month,
      });
      return ok({ members });
    } catch (error) {
      return fail(error);
    }
  },
};
