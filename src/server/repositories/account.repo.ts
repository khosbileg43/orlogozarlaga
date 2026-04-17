import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client/index";

export const accountRepo = {
  listByUser(userId: string) {
    return prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, balance: true },
    });
  },

  findByIdAndUserId(accountId: string, userId: string) {
    return prisma.account.findFirst({
      where: { id: accountId, userId },
      select: { id: true, name: true, balance: true, userId: true },
    });
  },

  findByIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    accountId: string,
    userId: string,
  ) {
    return tx.account.findFirst({
      where: { id: accountId, userId },
      select: { id: true, name: true, balance: true, userId: true },
    });
  },

  findByNameAndUserId(name: string, userId: string) {
    return prisma.account.findFirst({
      where: { userId, name },
      select: { id: true, name: true, balance: true },
    });
  },

  create(args: { userId: string; name: string; balance: number }) {
    return prisma.account.create({
      data: {
        userId: args.userId,
        name: args.name,
        balance: args.balance,
      },
      select: { id: true, name: true, balance: true },
    });
  },

  totalBalanceByUser(userId: string) {
    return prisma.account.aggregate({
      where: { userId },
      _sum: { balance: true },
    });
  },

  incrementBalanceIfOwnedTx(
    tx: Prisma.TransactionClient,
    args: {
      accountId: string;
      userId: string;
      by: number;
    },
  ) {
    return tx.account.updateMany({
      where: { id: args.accountId, userId: args.userId },
      data: { balance: { increment: args.by } },
    });
  },

  decrementBalanceIfOwnedAndSufficientTx(
    tx: Prisma.TransactionClient,
    args: {
      accountId: string;
      userId: string;
      amount: number;
    },
  ) {
    return tx.account.updateMany({
      where: {
        id: args.accountId,
        userId: args.userId,
        balance: { gte: args.amount },
      },
      data: {
        balance: { decrement: args.amount },
      },
    });
  },
};
