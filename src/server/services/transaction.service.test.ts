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
});
