import { prisma } from "@/lib/db/prisma";
import { ok, fail } from "@/utils/api-response";
import { ValidationAppError } from "@/utils/errors";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!email || !email.includes("@")) {
      throw new ValidationAppError("Valid email is required");
    }

    await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return ok({
      message: "If an account with this email exists, a reset link has been sent.",
    });
  } catch (error) {
    return fail(error);
  }
}
