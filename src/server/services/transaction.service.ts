import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ValidationAppError } from "@/utils/errors";
import { accountRepo } from "../repositories/account.repo";
import { transactionRepo } from "../repositories/transaction.repo";

function isTransactionType(
  value: string,
): value is "INCOME" | "EXPENSE" | "TRANSFER" {
  return value === "INCOME" || value === "EXPENSE" || value === "TRANSFER";
}

function isTransferWithDestination(transaction: {
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  toAccountId: string | null;
}) {
  return transaction.type === "TRANSFER" && Boolean(transaction.toAccountId);
}

async function rollbackTransactionBalance(
  tx: Parameters<typeof accountRepo.incrementBalanceIfOwnedTx>[0],
  userId: string,
  transaction: {
    accountId: string;
    toAccountId: string | null;
    type: "INCOME" | "EXPENSE" | "TRANSFER";
    amount: number;
  },
) {
  if (isTransferWithDestination(transaction)) {
    const sourceRollback = await accountRepo.incrementBalanceIfOwnedTx(tx, {
      accountId: transaction.accountId,
      userId,
      by: transaction.amount,
    });

    if (sourceRollback.count === 0) {
      throw new NotFoundError("Source account not found");
    }

    const destinationRollback = await accountRepo.incrementBalanceIfOwnedTx(tx, {
      accountId: transaction.toAccountId!,
      userId,
      by: -transaction.amount,
    });

    if (destinationRollback.count === 0) {
      throw new NotFoundError("Destination account not found");
    }

    return;
  }

  const rollbackDelta = transaction.type === "INCOME" ? -transaction.amount : transaction.amount;
  const updated = await accountRepo.incrementBalanceIfOwnedTx(tx, {
    accountId: transaction.accountId,
    userId,
    by: rollbackDelta,
  });

  if (updated.count === 0) {
    throw new NotFoundError("Account not found");
  }
}

async function applyTransactionBalance(
  tx: Parameters<typeof accountRepo.incrementBalanceIfOwnedTx>[0],
  userId: string,
  transaction: {
    accountId: string;
    toAccountId: string | null;
    type: "INCOME" | "EXPENSE" | "TRANSFER";
    amount: number;
  },
) {
  if (isTransferWithDestination(transaction)) {
    const sourceUpdated = await accountRepo.decrementBalanceIfOwnedAndSufficientTx(tx, {
      accountId: transaction.accountId,
      userId,
      amount: transaction.amount,
    });

    if (sourceUpdated.count === 0) {
      throw new ValidationAppError("Insufficient source account balance");
    }

    const destinationUpdated = await accountRepo.incrementBalanceIfOwnedTx(tx, {
      accountId: transaction.toAccountId!,
      userId,
      by: transaction.amount,
    });

    if (destinationUpdated.count === 0) {
      throw new NotFoundError("Destination account not found");
    }

    return;
  }

  if (transaction.type === "EXPENSE") {
    const updated = await accountRepo.decrementBalanceIfOwnedAndSufficientTx(tx, {
      accountId: transaction.accountId,
      userId,
      amount: transaction.amount,
    });

    if (updated.count === 0) {
      throw new ValidationAppError("Insufficient account balance");
    }

    return;
  }

  const updated = await accountRepo.incrementBalanceIfOwnedTx(tx, {
    accountId: transaction.accountId,
    userId,
    by: transaction.amount,
  });

  if (updated.count === 0) {
    throw new NotFoundError("Account not found");
  }
}

function validateNextTransaction(input: {
  accountId: string;
  toAccountId: string | null;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
}) {
  if (input.type === "TRANSFER") {
    if (!input.toAccountId) {
      throw new ValidationAppError("toAccountId is required for TRANSFER");
    }
    if (input.toAccountId === input.accountId) {
      throw new ValidationAppError(
        "Source and destination account must be different",
      );
    }
    return;
  }

  if (input.toAccountId) {
    throw new ValidationAppError("toAccountId is only allowed for TRANSFER");
  }
}

export const transactionService = {
  list(args: {
    userId: string;
    start: Date;
    end: Date;
    type?: string | null;
    page?: number;
    limit?: number;
  }) {
    const normalizedType =
      args.type && isTransactionType(args.type) ? args.type : undefined;

    if (args.type && !normalizedType) {
      throw new ValidationAppError(
        "Invalid transaction type. Use INCOME, EXPENSE, or TRANSFER",
      );
    }

    const page = args.page ?? 1;
    const limit = args.limit ?? 50;
    const offset = (page - 1) * limit;

    return transactionRepo.findManyByUserId({
      userId: args.userId,
      start: args.start,
      end: args.end,
      offset,
      limit,
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
      accountId?: string;
      toAccountId?: string | null;
      type?: "INCOME" | "EXPENSE" | "TRANSFER";
      category?: string;
      amount?: number;
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

      if (existing.lobbyId) {
        throw new ValidationAppError(
          "Lobby-linked transfers must be managed from the lobby dashboard",
        );
      }

      const nextAccountId = input.accountId ?? existing.accountId;
      const nextType = input.type ?? existing.type;
      const nextToAccountId =
        typeof input.toAccountId !== "undefined" ? input.toAccountId : existing.toAccountId;
      const nextAmount = input.amount ?? existing.amount;

      validateNextTransaction({
        accountId: nextAccountId,
        toAccountId: nextToAccountId ?? null,
        type: nextType,
      });

      await rollbackTransactionBalance(tx, userId, {
        accountId: existing.accountId,
        toAccountId: existing.toAccountId,
        type: existing.type,
        amount: existing.amount,
      });

      await applyTransactionBalance(tx, userId, {
        accountId: nextAccountId,
        toAccountId: nextToAccountId ?? null,
        type: nextType,
        amount: nextAmount,
      });

      return transactionRepo.updateByIdAndUserIdTx(tx, {
        id: transactionId,
        userId,
        data: {
          ...(typeof input.accountId !== "undefined" ? { accountId: input.accountId } : {}),
          ...(typeof input.toAccountId !== "undefined" ? { toAccountId: input.toAccountId } : {}),
          ...(typeof input.type !== "undefined" ? { type: input.type } : {}),
          ...(typeof input.category !== "undefined" ? { category: input.category } : {}),
          ...(typeof input.amount !== "undefined" ? { amount: input.amount } : {}),
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

      if (existing.lobbyId) {
        throw new ValidationAppError(
          "Lobby-linked transfers must be managed from the lobby dashboard",
        );
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
