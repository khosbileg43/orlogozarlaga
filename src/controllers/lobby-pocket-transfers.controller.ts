import { authService } from "@/server/services/auth.service";
import { lobbyPocketTransferService } from "@/server/services/lobby-pocket-transfer.service";
import { fail, ok } from "@/utils/api-response";
import { lobbyIdParamSchema } from "@/validators/lobby.validator";
import { transferFromPocketSchema } from "@/validators/lobby-pocket-transfer.validator";

export const lobbyPocketTransfersController = {
  async create(req: Request, lobbyId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { lobbyId: parsedLobbyId } = lobbyIdParamSchema.parse({ lobbyId });
      const body = await req.json();
      const parsed = transferFromPocketSchema.parse(body);
      const result = await lobbyPocketTransferService.create(user.id, parsedLobbyId, {
        accountId: parsed.accountId,
        memberId: parsed.memberId,
        amount: parsed.amount,
        description: parsed.description ?? null,
        date: new Date(parsed.date),
      });

      return ok(result, 201);
    } catch (error) {
      return fail(error);
    }
  },
};
