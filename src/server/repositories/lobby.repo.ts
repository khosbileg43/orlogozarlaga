import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const lobbyMemberSelect = {
  id: true,
  userId: true,
  role: true,
  status: true,
  joinedAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
} as const;

const lobbyBaseSelect = {
  id: true,
  name: true,
  description: true,
  balance: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const lobbyRepo = {
  listByUserId(userId: string) {
    return prisma.lobby.findMany({
      where: {
        members: {
          some: {
            userId,
            status: "ACTIVE",
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        ...lobbyBaseSelect,
        members: {
          where: {
            OR: [{ userId }, { status: "ACTIVE" }],
          },
          select: lobbyMemberSelect,
        },
      },
    });
  },

  findByIdAndUserId(lobbyId: string, userId: string) {
    return prisma.lobby.findFirst({
      where: {
        id: lobbyId,
        members: {
          some: {
            userId,
            status: "ACTIVE",
          },
        },
      },
      select: {
        ...lobbyBaseSelect,
        members: {
          where: { status: "ACTIVE" },
          select: lobbyMemberSelect,
          orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        },
      },
    });
  },

  findByIdTx(tx: Prisma.TransactionClient, lobbyId: string) {
    return tx.lobby.findUnique({
      where: { id: lobbyId },
      select: {
        ...lobbyBaseSelect,
      },
    });
  },

  createTx(
    tx: Prisma.TransactionClient,
    args: {
      createdById: string;
      name: string;
      description: string | null;
    },
  ) {
    return tx.lobby.create({
      data: {
        createdById: args.createdById,
        name: args.name,
        description: args.description,
        members: {
          create: {
            userId: args.createdById,
            role: "OWNER",
            status: "ACTIVE",
          },
        },
      },
      select: {
        ...lobbyBaseSelect,
        members: {
          where: { status: "ACTIVE" },
          select: lobbyMemberSelect,
          orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        },
      },
    });
  },

  updateById(
    lobbyId: string,
    data: {
      name?: string;
      description?: string | null;
    },
  ) {
    return prisma.lobby.update({
      where: { id: lobbyId },
      data,
      select: {
        ...lobbyBaseSelect,
        members: {
          where: { status: "ACTIVE" },
          select: lobbyMemberSelect,
          orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        },
      },
    });
  },

  incrementBalanceByIdTx(
    tx: Prisma.TransactionClient,
    args: {
      lobbyId: string;
      by: number;
    },
  ) {
    return tx.lobby.updateMany({
      where: { id: args.lobbyId },
      data: {
        balance: { increment: args.by },
      },
    });
  },

  deleteById(lobbyId: string) {
    return prisma.lobby.delete({
      where: { id: lobbyId },
      select: {
        ...lobbyBaseSelect,
        members: {
          select: lobbyMemberSelect,
          orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        },
      },
    });
  },
};
