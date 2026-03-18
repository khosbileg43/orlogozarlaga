import { authService } from "@/server/services/auth.service";
import { fail, ok } from "@/utils/api-response";
import { withObservedRequest } from "@/utils/observability";

export async function GET(req: Request) {
  return withObservedRequest("api.auth.me", req, async () => {
    try {
      const user = await authService.requireAuthenticatedUser();
      return ok({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      return fail(error);
    }
  });
}
