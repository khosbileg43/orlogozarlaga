import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const transactionSelect = {
  id: true,
  type: true,
  category: true,
  amount: true,
  description: true,
  date: true,
  accountId: true,
  toAccountId: true,
  lobbyId: true,
} as const;

const transactionSelectWithUser = {
  ...transactionSelect,
  userId: true,
} as const;

export const transactionRepo = {
  findManyByUserId(args: {
    userId: string;
    start: Date;
    end: Date;
    offset: number;
    limit: number;
    type?: "INCOME" | "EXPENSE" | "TRANSFER";
  }) {
    return prisma.transaction.findMany({
      where: {
        userId: args.userId,
        date: { gte: args.start, lt: args.end },
        ...(args.type ? { type: args.type } : {}),
      },
      orderBy: { date: "desc" },
      skip: args.offset,
      take: args.limit,
      select: transactionSelect,
    });
  },

  findByIdAndUserId(transactionId: string, userId: string) {
    return prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      select: transactionSelect,
    });
  },

  findByIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    transactionId: string,
    userId: string,
  ) {
    return tx.transaction.findFirst({
      where: { id: transactionId, userId },
      select: transactionSelect,
    });
  },

  findByIdTx(tx: Prisma.TransactionClient, transactionId: string) {
    return tx.transaction.findUnique({
      where: { id: transactionId },
      select: transactionSelectWithUser,
    });
  },

  createTx(
    tx: Prisma.TransactionClient,
    data: {
      userId: string;
      accountId: string;
      toAccountId?: string;
      lobbyId?: string;
      type: "INCOME" | "EXPENSE" | "TRANSFER";
      category: string;
      amount: number;
      description?: string | null;
      date: Date;
    },
  ) {
    return tx.transaction.create({
      data,
      select: transactionSelect,
    });
  },

  updateByIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    args: {
      id: string;
      userId: string;
      data: {
        accountId?: string;
        toAccountId?: string | null;
        type?: "INCOME" | "EXPENSE" | "TRANSFER";
        category?: string;
        amount?: number;
        description?: string | null;
        date?: Date;
      };
    },
  ) {
    return tx.transaction.update({
      where: { id: args.id },
      data: args.data,
      select: transactionSelect,
    });
  },

  deleteByIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    args: {
      id: string;
      userId: string;
    },
  ) {
    return tx.transaction.delete({
      where: { id: args.id },
      select: transactionSelect,
    });
  },
};
