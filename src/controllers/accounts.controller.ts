import { authService } from "@/server/services/auth.service";
import { accountService } from "@/server/services/account.service";
import { fail, ok } from "@/utils/api-response";
import { createAccountSchema } from "@/validators/account.validator";

export const accountsController = {
  async getMany() {
    try {
      const user = await authService.requireAuthenticatedUser();
      const accounts = await accountService.listByUser(user.id);
      return ok({ accounts });
    } catch (error) {
      return fail(error);
    }
  },

  async create(req: Request) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const body = await req.json();
      const parsed = createAccountSchema.parse(body);
      const account = await accountService.create(user.id, {
        name: parsed.name,
        balance: parsed.balance,
      });
      return ok({ account }, 201);
    } catch (error) {
      return fail(error);
    }
  },
};
