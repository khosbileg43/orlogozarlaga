import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export const transactionRepo = {
  list(args: {
    userId: string;
    start: Date;
    end: Date;
    type?: "INCOME" | "EXPENSE";
  }) {
    return prisma.transaction.findMany({
      where: {
        userId: args.userId,
        date: { gte: args.start, lt: args.end },
        ...(args.type ? { type: args.type } : {}),
      },
      orderBy: { date: "desc" },
      select: {
        id: true,
        type: true,
        category: true,
        amount: true,
        description: true,
        date: true,
        accountId: true,
      },
    });
  },

  createTx(
    tx: Prisma.TransactionClient,
    data: {
      userId: string;
      accountId: string;
      type: "INCOME" | "EXPENSE";
      category: string;
      amount: number;
      description?: string;
      date: Date;
    },
  ) {
    return tx.transaction.create({
      data,
      select: {
        id: true,
        type: true,
        category: true,
        amount: true,
        description: true,
        date: true,
        accountId: true,
      },
    });
  },
};
