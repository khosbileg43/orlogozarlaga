import { clearSessionCookie } from "@/lib/auth/auth0";
import { ok, fail } from "@/utils/api-response";

export async function POST() {
  try {
    const response = ok({ success: true });
    return clearSessionCookie(response);
  } catch (error) {
    return fail(error);
  }
}
