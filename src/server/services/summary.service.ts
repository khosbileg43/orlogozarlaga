import { accountRepo } from "../repositories/account.repo";
import { summaryRepo } from "../repositories/summary.repo";

export const summaryService = {
  async monthly(userId: string, start: Date, end: Date) {
    const [incomeAgg, expenseAgg, incomeCats, expenseCats, balanceAgg] =
      await Promise.all([
        summaryRepo.getIncomeTotal(userId, start, end),
        summaryRepo.getExpenseTotal(userId, start, end),
        summaryRepo.getIncomeByCategory(userId, start, end),
        summaryRepo.getExpenseByCategory(userId, start, end),
        accountRepo.totalBalanceByUser(userId),
      ]);

    return {
      incomeTotal: incomeAgg._sum.amount ?? 0,
      expenseTotal: expenseAgg._sum.amount ?? 0,
      balanceTotal: balanceAgg._sum.balance ?? 0,
      incomeByCategory: incomeCats.map((x) => ({
        category: x.category,
        amount: x._sum.amount ?? 0,
      })),
      expenseByCategory: expenseCats.map((x) => ({
        category: x.category,
        amount: x._sum.amount ?? 0,
      })),
    };
  },
};
