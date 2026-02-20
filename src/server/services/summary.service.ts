import { summaryRepo } from "../repositories/summary.repo";

export const summaryService = {
  async monthly(userId: string, start: Date, end: Date) {
    const [incomeAgg, expenseAgg, incomeCats, expenseCats] = await Promise.all([
      summaryRepo.incomeTotal(userId, start, end),
      summaryRepo.expenseTotal(userId, start, end),
      summaryRepo.incomeByCategory(userId, start, end),
      summaryRepo.expenseByCategory(userId, start, end),
    ]);

    return {
      incomeTotal: incomeAgg._sum.amount ?? 0,
      expenseTotal: expenseAgg._sum.amount ?? 0,
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
