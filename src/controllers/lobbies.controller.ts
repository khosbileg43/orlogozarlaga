import { authService } from "@/server/services/auth.service";
import { lobbyService } from "@/server/services/lobby.service";
import { fail, ok } from "@/utils/api-response";
import {
  createLobbySchema,
  lobbyIdParamSchema,
  updateLobbySchema,
} from "@/validators/lobby.validator";

export const lobbiesController = {
  async getMany() {
    try {
      const user = await authService.requireAuthenticatedUser();
      const lobbies = await lobbyService.listByUser(user.id);
      return ok({ lobbies });
    } catch (error) {
      return fail(error);
    }
  },

  async getById(lobbyId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { lobbyId: parsedId } = lobbyIdParamSchema.parse({ lobbyId });
      const lobby = await lobbyService.findByIdAndUserId(parsedId, user.id);
      return ok({ lobby });
    } catch (error) {
      return fail(error);
    }
  },

  async create(req: Request) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const body = await req.json();
      const parsed = createLobbySchema.parse(body);
      const lobby = await lobbyService.create(user.id, {
        name: parsed.name,
        description: parsed.description,
      });
      return ok({ lobby }, 201);
    } catch (error) {
      return fail(error);
    }
  },

  async update(req: Request, lobbyId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { lobbyId: parsedId } = lobbyIdParamSchema.parse({ lobbyId });
      const body = await req.json();
      const parsed = updateLobbySchema.parse(body);
      const lobby = await lobbyService.update(user.id, parsedId, {
        name: parsed.name,
        description: parsed.description,
      });
      return ok({ lobby });
    } catch (error) {
      return fail(error);
    }
  },

  async remove(lobbyId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { lobbyId: parsedId } = lobbyIdParamSchema.parse({ lobbyId });
      const lobby = await lobbyService.delete(user.id, parsedId);
      return ok({ lobby });
    } catch (error) {
      return fail(error);
    }
  },
};
