import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ValidationAppError } from "@/utils/errors";
import { accountRepo } from "../repositories/account.repo";
import { transactionRepo } from "../repositories/transaction.repo";

function isTransactionType(value: string): value is "INCOME" | "EXPENSE" {
  return value === "INCOME" || value === "EXPENSE";
}

export const transactionService = {
  list(args: {
    userId: string;
    start: Date;
    end: Date;
    type?: string | null;
  }) {
    const normalizedType =
      args.type && isTransactionType(args.type) ? args.type : undefined;

    if (args.type && !normalizedType) {
      throw new ValidationAppError(
        "Invalid transaction type. Use INCOME or EXPENSE",
      );
    }

    return transactionRepo.findManyByUserId({
      userId: args.userId,
      start: args.start,
      end: args.end,
      ...(normalizedType ? { type: normalizedType } : {}),
    });
  },

  async findByIdAndUserId(userId: string, transactionId: string) {
    const transaction = await transactionRepo.findByIdAndUserId(
      transactionId,
      userId,
    );
    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }
    return transaction;
  },

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
    const balanceDelta = input.type === "INCOME" ? input.amount : -input.amount;

    // IMPORTANT: both create transaction + update balance must be atomic
    const created = await prisma.$transaction(async (tx) => {
      const updated = await accountRepo.incrementBalanceIfOwnedTx(tx, {
        accountId: input.accountId,
        userId,
        by: balanceDelta,
      });

      if (updated.count === 0) {
        throw new NotFoundError("Account not found");
      }

      return transactionRepo.createTx(tx, {
        userId,
        accountId: input.accountId,
        type: input.type,
        category: input.category,
        amount: input.amount,
        description: input.description,
        date: input.date,
      });
    });

    return created;
  },

  async update(
    userId: string,
    transactionId: string,
    input: {
      category?: string;
      description?: string | null;
      date?: Date;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await transactionRepo.findByIdAndUserIdTx(
        tx,
        transactionId,
        userId,
      );

      if (!existing) {
        throw new NotFoundError("Transaction not found");
      }

      return transactionRepo.updateByIdAndUserIdTx(tx, {
        id: transactionId,
        userId,
        data: {
          ...(input.category ? { category: input.category } : {}),
          ...(typeof input.description !== "undefined"
            ? { description: input.description }
            : {}),
          ...(input.date ? { date: input.date } : {}),
        },
      });
    });
  },

  async delete(userId: string, transactionId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await transactionRepo.findByIdAndUserIdTx(
        tx,
        transactionId,
        userId,
      );

      if (!existing) {
        throw new NotFoundError("Transaction not found");
      }

      const rollbackDelta =
        existing.type === "INCOME" ? -existing.amount : existing.amount;

      const accountUpdate = await accountRepo.incrementBalanceIfOwnedTx(tx, {
        accountId: existing.accountId,
        userId,
        by: rollbackDelta,
      });

      if (accountUpdate.count === 0) {
        throw new NotFoundError("Account not found");
      }

      return transactionRepo.deleteByIdAndUserIdTx(tx, {
        id: transactionId,
        userId,
      });
    });
  },
};
