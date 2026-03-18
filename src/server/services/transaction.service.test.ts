jest.mock("@/lib/db/prisma", () => ({
  prisma: { $transaction: jest.fn() },
}));

jest.mock("@/server/repositories/account.repo", () => ({
  accountRepo: { incrementBalanceIfOwnedTx: jest.fn() },
}));

jest.mock("@/server/repositories/transaction.repo", () => ({
  transactionRepo: {
    findManyByUserId: jest.fn(),
    createTx: jest.fn(),
    findByIdAndUserIdTx: jest.fn(),
    updateByIdAndUserIdTx: jest.fn(),
    deleteByIdAndUserIdTx: jest.fn(),
  },
}));

import { prisma } from "@/lib/db/prisma";
import { accountRepo } from "@/server/repositories/account.repo";
import { transactionRepo } from "@/server/repositories/transaction.repo";
import { transactionService } from "./transaction.service";

describe("transactionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws on invalid type filter", () => {
    expect(() =>
      transactionService.list({
        userId: "u1",
        start: new Date("2026-03-01T00:00:00.000Z"),
        end: new Date("2026-04-01T00:00:00.000Z"),
        type: "BAD",
      }),
    ).toThrow("Invalid transaction type");
  });

  it("applies pagination when listing transactions", async () => {
    (transactionRepo.findManyByUserId as jest.Mock).mockResolvedValue([]);

    await transactionService.list({
      userId: "u1",
      start: new Date("2026-03-01T00:00:00.000Z"),
      end: new Date("2026-04-01T00:00:00.000Z"),
      page: 2,
      limit: 25,
    });

    expect(transactionRepo.findManyByUserId).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        offset: 25,
        limit: 25,
      }),
    );
  });

  it("creates expense transaction and decreases balance atomically", async () => {
    const tx = {} as never;
    const created = {
      id: "t1",
      type: "EXPENSE",
      category: "Food",
      amount: 500,
      description: "Lunch",
      date: new Date("2026-03-02T10:00:00.000Z"),
      accountId: "a1",
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (fn) => fn(tx));
    (accountRepo.incrementBalanceIfOwnedTx as jest.Mock).mockResolvedValue({
      count: 1,
    });
    (transactionRepo.createTx as jest.Mock).mockResolvedValue(created);

    const result = await transactionService.create("u1", {
      accountId: "a1",
      type: "EXPENSE",
      category: "Food",
      amount: 500,
      description: "Lunch",
      date: new Date("2026-03-02T10:00:00.000Z"),
    });

    expect(accountRepo.incrementBalanceIfOwnedTx).toHaveBeenCalledWith(tx, {
      accountId: "a1",
      userId: "u1",
      by: -500,
    });
    expect(transactionRepo.createTx).toHaveBeenCalled();
    expect(result).toEqual(created);
  });

  it("throws when account is not found during create", async () => {
    const tx = {} as never;
    (prisma.$transaction as jest.Mock).mockImplementation(async (fn) => fn(tx));
    (accountRepo.incrementBalanceIfOwnedTx as jest.Mock).mockResolvedValue({
      count: 0,
    });

    await expect(
      transactionService.create("u1", {
        accountId: "missing",
        type: "INCOME",
        category: "Salary",
        amount: 1000,
        date: new Date("2026-03-02T10:00:00.000Z"),
      }),
    ).rejects.toThrow("Account not found");
  });

  it("creates transfer transaction and updates both balances atomically", async () => {
    const tx = {} as never;
    const created = {
      id: "t2",
      type: "TRANSFER",
      category: "Between accounts",
      amount: 1200,
      description: "Move to savings",
      date: new Date("2026-03-03T10:00:00.000Z"),
      accountId: "a1",
      toAccountId: "a2",
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (fn) => fn(tx));
    (accountRepo.incrementBalanceIfOwnedTx as jest.Mock)
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 });
    (transactionRepo.createTx as jest.Mock).mockResolvedValue(created);

    const result = await transactionService.create("u1", {
      accountId: "a1",
      toAccountId: "a2",
      type: "TRANSFER",
      category: "Between accounts",
      amount: 1200,
      description: "Move to savings",
      date: new Date("2026-03-03T10:00:00.000Z"),
    });

    expect(accountRepo.incrementBalanceIfOwnedTx).toHaveBeenNthCalledWith(1, tx, {
      accountId: "a1",
      userId: "u1",
      by: -1200,
    });
    expect(accountRepo.incrementBalanceIfOwnedTx).toHaveBeenNthCalledWith(2, tx, {
      accountId: "a2",
      userId: "u1",
      by: 1200,
    });
    expect(transactionRepo.createTx).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        accountId: "a1",
        toAccountId: "a2",
        type: "TRANSFER",
        amount: 1200,
      }),
    );
    expect(result).toEqual(created);
  });

  it("throws when transfer is missing destination account", async () => {
    await expect(
      transactionService.create("u1", {
        accountId: "a1",
        type: "TRANSFER",
        category: "Between accounts",
        amount: 100,
        date: new Date("2026-03-02T10:00:00.000Z"),
      }),
    ).rejects.toThrow("toAccountId is required for TRANSFER");

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
