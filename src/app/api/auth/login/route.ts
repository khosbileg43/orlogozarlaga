import { prisma } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/auth/auth0";
import { ok, fail } from "@/utils/api-response";
import { UnauthorizedError, ValidationAppError } from "@/utils/errors";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !email.includes("@")) {
      throw new ValidationAppError("Valid email is required");
    }

    if (!password || password.length < 6) {
      throw new ValidationAppError("Password must be at least 6 characters");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, auth0Id: true },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const response = ok(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      200,
    );

    return setSessionCookie(response, {
      user: {
        sub: user.auth0Id ?? `local:${user.id}`,
        email: user.email,
        name: user.name ?? user.email,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
