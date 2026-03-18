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
} as const;

export const transactionRepo = {
  findManyByUserId(args: {
    userId: string;
    start: Date;
    end: Date;
    type?: "INCOME" | "EXPENSE" | "TRANSFER";
  }) {
    return prisma.transaction.findMany({
      where: {
        userId: args.userId,
        date: { gte: args.start, lt: args.end },
        ...(args.type ? { type: args.type } : {}),
      },
      orderBy: { date: "desc" },
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

  createTx(
    tx: Prisma.TransactionClient,
    data: {
      userId: string;
      accountId: string;
      toAccountId?: string;
      type: "INCOME" | "EXPENSE" | "TRANSFER";
      category: string;
      amount: number;
      description?: string;
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
        category?: string;
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
