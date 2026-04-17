import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client/index";

const lobbyMemberSelect = {
  id: true,
  lobbyId: true,
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

export const lobbyMemberRepo = {
  listByLobbyId(lobbyId: string) {
    return prisma.lobbyMember.findMany({
      where: { lobbyId },
      orderBy: [{ status: "asc" }, { role: "asc" }, { joinedAt: "asc" }],
      select: lobbyMemberSelect,
    });
  },

  findByIdAndLobbyId(memberId: string, lobbyId: string) {
    return prisma.lobbyMember.findFirst({
      where: { id: memberId, lobbyId },
      select: lobbyMemberSelect,
    });
  },

  findByLobbyIdAndUserId(lobbyId: string, userId: string) {
    return prisma.lobbyMember.findFirst({
      where: { lobbyId, userId },
      select: lobbyMemberSelect,
    });
  },

  findActiveByLobbyIdAndUserId(lobbyId: string, userId: string) {
    return prisma.lobbyMember.findFirst({
      where: { lobbyId, userId, status: "ACTIVE" },
      select: lobbyMemberSelect,
    });
  },

  findByIdAndLobbyIdTx(
    tx: Prisma.TransactionClient,
    memberId: string,
    lobbyId: string,
  ) {
    return tx.lobbyMember.findFirst({
      where: { id: memberId, lobbyId },
      select: lobbyMemberSelect,
    });
  },

  findByLobbyIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    lobbyId: string,
    userId: string,
  ) {
    return tx.lobbyMember.findFirst({
      where: { lobbyId, userId },
      select: lobbyMemberSelect,
    });
  },

  countActiveOwnersByLobbyIdTx(tx: Prisma.TransactionClient, lobbyId: string) {
    return tx.lobbyMember.count({
      where: { lobbyId, status: "ACTIVE", role: "OWNER" },
    });
  },

  createTx(
    tx: Prisma.TransactionClient,
    args: {
      lobbyId: string;
      userId: string;
      role: "OWNER" | "MEMBER";
    },
  ) {
    return tx.lobbyMember.create({
      data: {
        lobbyId: args.lobbyId,
        userId: args.userId,
        role: args.role,
        status: "ACTIVE",
      },
      select: lobbyMemberSelect,
    });
  },

  updateByIdTx(
    tx: Prisma.TransactionClient,
    args: {
      memberId: string;
      data: {
        role?: "OWNER" | "MEMBER";
        status?: "ACTIVE" | "LEFT";
        joinedAt?: Date;
      };
    },
  ) {
    return tx.lobbyMember.update({
      where: { id: args.memberId },
      data: args.data,
      select: lobbyMemberSelect,
    });
  },
};
