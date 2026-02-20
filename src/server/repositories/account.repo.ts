import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export const accountRepo = {
  listByUser(userId: string) {
    return prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, balance: true },
    });
  },

  findById(accountId: string) {
    return prisma.account.findUnique({ where: { id: accountId } });
  },

  updateBalanceTx(
    tx: Prisma.TransactionClient,
    accountId: string,
    balance: number,
  ) {
    // tx is Prisma transaction client
    return tx.account.update({
      where: { id: accountId },
      data: { balance },
      select: { id: true, name: true, balance: true },
    });
  },
};
