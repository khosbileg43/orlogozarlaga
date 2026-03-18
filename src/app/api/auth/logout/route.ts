import { clearSessionCookie } from "@/lib/auth/auth0";
import { ok, fail } from "@/utils/api-response";
import { withObservedRequest } from "@/utils/observability";

export async function POST(req: Request) {
  return withObservedRequest("api.auth.logout", req, async () => {
    try {
      const response = ok({ success: true });
      return clearSessionCookie(response);
    } catch (error) {
      return fail(error);
    }
  });
}
