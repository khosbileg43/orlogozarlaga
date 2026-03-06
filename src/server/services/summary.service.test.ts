jest.mock("@/server/repositories/summary.repo", () => ({
  summaryRepo: {
    getIncomeTotal: jest.fn(),
    getExpenseTotal: jest.fn(),
    getIncomeByCategory: jest.fn(),
    getExpenseByCategory: jest.fn(),
  },
}));

jest.mock("@/server/repositories/account.repo", () => ({
  accountRepo: {
    totalBalanceByUser: jest.fn(),
  },
}));

import { accountRepo } from "@/server/repositories/account.repo";
import { summaryRepo } from "@/server/repositories/summary.repo";
import { summaryService } from "./summary.service";

describe("summaryService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns monthly summary with null-safe totals", async () => {
    (summaryRepo.getIncomeTotal as jest.Mock).mockResolvedValue({
      _sum: { amount: 1200 },
    });
    (summaryRepo.getExpenseTotal as jest.Mock).mockResolvedValue({
      _sum: { amount: null },
    });
    (summaryRepo.getIncomeByCategory as jest.Mock).mockResolvedValue([
      { category: "Salary", _sum: { amount: 1200 } },
    ]);
    (summaryRepo.getExpenseByCategory as jest.Mock).mockResolvedValue([
      { category: "Food", _sum: { amount: null } },
    ]);
    (accountRepo.totalBalanceByUser as jest.Mock).mockResolvedValue({
      _sum: { balance: 900 },
    });

    const result = await summaryService.monthly(
      "u1",
      new Date("2026-03-01T00:00:00.000Z"),
      new Date("2026-04-01T00:00:00.000Z"),
    );

    expect(result).toEqual({
      incomeTotal: 1200,
      expenseTotal: 0,
      balanceTotal: 900,
      incomeByCategory: [{ category: "Salary", amount: 1200 }],
      expenseByCategory: [{ category: "Food", amount: 0 }],
    });
  });
});
