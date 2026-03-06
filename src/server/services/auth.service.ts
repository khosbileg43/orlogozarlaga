import { auth0 } from "@/lib/auth/auth0";
import { AuthenticatedUser } from "@/types";
import { UnauthorizedError } from "@/utils/errors";
import { userRepo } from "../repositories/user.repo";

export const authService = {
  async requireAuthenticatedUser(): Promise<AuthenticatedUser> {
    const session = await auth0.getSession();
    const sub = session?.user.sub;
    const email = session?.user.email;

    if (!sub) {
      throw new UnauthorizedError();
    }

    if (!email) {
      throw new UnauthorizedError(
        "Authenticated user is missing an email claim",
      );
    }

    const user = await userRepo.upsertFromAuth0Identity({
      auth0Id: sub,
      email,
      name: session.user.name ?? null,
    });

    if (!user.auth0Id) {
      throw new UnauthorizedError("Failed to bind Auth0 identity");
    }

    return {
      id: user.id,
      auth0Id: user.auth0Id,
      email: user.email,
      name: user.name,
    };
  },
};
