import { prisma } from "@/lib/db/prisma";
import { accountRepo } from "../repositories/account.repo";
import { transactionRepo } from "../repositories/transaction.repo";

export const transactionService = {
  async create(
    userId: string,
    input: {
      accountId: string;
      type: "INCOME" | "EXPENSE";
      category: string;
      amount: number;
      description?: string;
      date: Date;
    },
  ) {
    const account = await accountRepo.findById(input.accountId);
    if (!account || account.userId !== userId)
      throw new Error("Account not found");

    const nextBalance =
      input.type === "INCOME"
        ? account.balance + input.amount
        : account.balance - input.amount;

    // IMPORTANT: both create transaction + update balance must be atomic
    const created = await prisma.$transaction(async (tx) => {
      const t = await transactionRepo.createTx(tx, {
        userId,
        accountId: input.accountId,
        type: input.type,
        category: input.category,
        amount: input.amount,
        description: input.description,
        date: input.date,
      });

      await accountRepo.updateBalanceTx(tx, input.accountId, nextBalance);
      return t;
    });

    return created;
  },
};
