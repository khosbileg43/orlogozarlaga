import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const lobbyTransactionSelect = {
  id: true,
  lobbyId: true,
  memberId: true,
  personalTransactionId: true,
  type: true,
  category: true,
  amount: true,
  description: true,
  date: true,
  createdAt: true,
  updatedAt: true,
  member: {
    select: {
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
    },
  },
} as const;

export const lobbyTransactionRepo = {
  findManyByLobbyId(args: {
    lobbyId: string;
    start?: Date;
    end?: Date;
    offset: number;
    limit: number;
    type?: "INCOME" | "EXPENSE" | "TRANSFER";
  }) {
    return prisma.lobbyTransaction.findMany({
      where: {
        lobbyId: args.lobbyId,
        type: {
          in: args.type ? [args.type] : ["INCOME", "EXPENSE"],
        },
        ...(args.start && args.end ? { date: { gte: args.start, lt: args.end } } : {}),
      },
      orderBy: { date: "desc" },
      skip: args.offset,
      take: args.limit,
      select: lobbyTransactionSelect,
    });
  },

  findByIdAndLobbyId(transactionId: string, lobbyId: string) {
    return prisma.lobbyTransaction.findFirst({
      where: { id: transactionId, lobbyId },
      select: lobbyTransactionSelect,
    });
  },

  findByIdAndLobbyIdTx(
    tx: Prisma.TransactionClient,
    transactionId: string,
    lobbyId: string,
  ) {
    return tx.lobbyTransaction.findFirst({
      where: { id: transactionId, lobbyId },
      select: lobbyTransactionSelect,
    });
  },

  createTx(
    tx: Prisma.TransactionClient,
    data: {
      lobbyId: string;
      memberId: string;
      personalTransactionId?: string | null;
      type: "INCOME" | "EXPENSE" | "TRANSFER";
      category: string;
      amount: number;
      description?: string | null;
      date: Date;
    },
  ) {
    return tx.lobbyTransaction.create({
      data,
      select: lobbyTransactionSelect,
    });
  },

  updateByIdTx(
    tx: Prisma.TransactionClient,
    args: {
      id: string;
      data: {
        memberId?: string;
        personalTransactionId?: string | null;
        type?: "INCOME" | "EXPENSE" | "TRANSFER";
        category?: string;
        amount?: number;
        description?: string | null;
        date?: Date;
      };
    },
  ) {
    return tx.lobbyTransaction.update({
      where: { id: args.id },
      data: args.data,
      select: lobbyTransactionSelect,
    });
  },

  deleteByIdTx(tx: Prisma.TransactionClient, id: string) {
    return tx.lobbyTransaction.delete({
      where: { id },
      select: lobbyTransactionSelect,
    });
  },
};
