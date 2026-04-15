import { authService } from "@/server/services/auth.service";
import { lobbyMemberService } from "@/server/services/lobby-member.service";
import { fail, ok } from "@/utils/api-response";
import {
  createLobbyMemberSchema,
  lobbyMemberIdParamSchema,
} from "@/validators/lobby-member.validator";
import { lobbyIdParamSchema } from "@/validators/lobby.validator";

export const lobbyMembersController = {
  async getMany(lobbyId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { lobbyId: parsedLobbyId } = lobbyIdParamSchema.parse({ lobbyId });
      const members = await lobbyMemberService.listByLobbyId(user.id, parsedLobbyId);
      return ok({ members });
    } catch (error) {
      return fail(error);
    }
  },

  async create(req: Request, lobbyId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { lobbyId: parsedLobbyId } = lobbyIdParamSchema.parse({ lobbyId });
      const body = await req.json();
      const parsed = createLobbyMemberSchema.parse(body);
      const member = await lobbyMemberService.create(user.id, parsedLobbyId, {
        email: parsed.email,
        role: parsed.role,
      });
      return ok({ member }, 201);
    } catch (error) {
      return fail(error);
    }
  },

  async remove(lobbyId: string, memberId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const {
        lobbyId: parsedLobbyId,
        memberId: parsedMemberId,
      } = lobbyMemberIdParamSchema.parse({
        lobbyId,
        memberId,
      });
      const member = await lobbyMemberService.remove(
        user.id,
        parsedLobbyId,
        parsedMemberId,
      );
      return ok({ member });
    } catch (error) {
      return fail(error);
    }
  },
};
