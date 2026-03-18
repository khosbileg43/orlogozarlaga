import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ValidationAppError } from "@/utils/errors";
import { accountRepo } from "../repositories/account.repo";
import { transactionRepo } from "../repositories/transaction.repo";

function isTransactionType(
  value: string,
): value is "INCOME" | "EXPENSE" | "TRANSFER" {
  return value === "INCOME" || value === "EXPENSE" || value === "TRANSFER";
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
        "Invalid transaction type. Use INCOME, EXPENSE, or TRANSFER",
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
      toAccountId?: string;
      type: "INCOME" | "EXPENSE" | "TRANSFER";
      category: string;
      amount: number;
      description?: string;
      date: Date;
    },
  ) {
    if (input.type === "TRANSFER") {
      const destinationAccountId = input.toAccountId;
      if (!destinationAccountId) {
        throw new ValidationAppError("toAccountId is required for TRANSFER");
      }
      if (destinationAccountId === input.accountId) {
        throw new ValidationAppError(
          "Source and destination account must be different",
        );
      }

      return prisma.$transaction(async (tx) => {
        const sourceUpdated = await accountRepo.incrementBalanceIfOwnedTx(tx, {
          accountId: input.accountId,
          userId,
          by: -input.amount,
        });

        if (sourceUpdated.count === 0) {
          throw new NotFoundError("Source account not found");
        }

        const destinationUpdated = await accountRepo.incrementBalanceIfOwnedTx(
          tx,
          {
            accountId: destinationAccountId,
            userId,
            by: input.amount,
          },
        );

        if (destinationUpdated.count === 0) {
          throw new NotFoundError("Destination account not found");
        }

        return transactionRepo.createTx(tx, {
          userId,
          accountId: input.accountId,
          toAccountId: destinationAccountId,
          type: input.type,
          category: input.category,
          amount: input.amount,
          description: input.description,
          date: input.date,
        });
      });
    }

    const balanceDelta = input.type === "INCOME" ? input.amount : -input.amount;

    // IMPORTANT: both create transaction + update balance must be atomic
    return prisma.$transaction(async (tx) => {
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

      if (existing.type === "TRANSFER") {
        if (!existing.toAccountId) {
          throw new ValidationAppError(
            "Transfer transaction has no destination account",
          );
        }

        const sourceRollback = await accountRepo.incrementBalanceIfOwnedTx(tx, {
          accountId: existing.accountId,
          userId,
          by: existing.amount,
        });

        if (sourceRollback.count === 0) {
          throw new NotFoundError("Source account not found");
        }

        const destinationRollback = await accountRepo.incrementBalanceIfOwnedTx(
          tx,
          {
            accountId: existing.toAccountId,
            userId,
            by: -existing.amount,
          },
        );

        if (destinationRollback.count === 0) {
          throw new NotFoundError("Destination account not found");
        }

        return transactionRepo.deleteByIdAndUserIdTx(tx, {
          id: transactionId,
          userId,
        });
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
