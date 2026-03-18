import { prisma } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/auth/auth0";
import { ok, fail } from "@/utils/api-response";
import { AppError, ValidationAppError } from "@/utils/errors";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const confirmPassword = body.confirmPassword ?? "";

    if (!name) {
      throw new ValidationAppError("Name is required");
    }

    if (!email || !email.includes("@")) {
      throw new ValidationAppError("Valid email is required");
    }

    if (!password || password.length < 6) {
      throw new ValidationAppError("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      throw new ValidationAppError("Password confirmation does not match");
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new AppError(409, "Email already registered", "CONFLICT");
    }

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
        },
        select: { id: true, email: true, name: true, auth0Id: true },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          name: "Cash",
          balance: 0,
        },
      });

      return user;
    });

    const response = ok(
      {
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
        },
      },
      201,
    );

    return setSessionCookie(response, {
      user: {
        sub: createdUser.auth0Id ?? `local:${createdUser.id}`,
        email: createdUser.email,
        name: createdUser.name ?? createdUser.email,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
