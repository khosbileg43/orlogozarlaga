import { prisma } from "@/lib/db/prisma";

type UpsertAuthUserInput = {
  auth0Id: string;
  email: string;
  name?: string | null;
};

export const userRepo = {
  findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, auth0Id: true, email: true, name: true },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, auth0Id: true, email: true, name: true },
    });
  },

  async upsertFromAuth0Identity(input: UpsertAuthUserInput) {
    const existingByAuth0 = await prisma.user.findUnique({
      where: { auth0Id: input.auth0Id },
      select: { id: true, auth0Id: true, email: true, name: true },
    });

    if (existingByAuth0) {
      return prisma.user.update({
        where: { id: existingByAuth0.id },
        data: {
          email: input.email,
          name: existingByAuth0.name ?? input.name ?? null,
        },
        select: { id: true, auth0Id: true, email: true, name: true },
      });
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingByEmail) {
      return prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          auth0Id: input.auth0Id,
          name: input.name ?? null,
        },
        select: { id: true, auth0Id: true, email: true, name: true },
      });
    }

    return prisma.user.create({
      data: {
        auth0Id: input.auth0Id,
        email: input.email,
        name: input.name ?? null,
      },
      select: { id: true, auth0Id: true, email: true, name: true },
    });
  },
};
