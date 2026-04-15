import { prisma } from "@/lib/db/prisma";

export const summaryRepo = {
  getIncomeTotal(userId: string, start: Date, end: Date) {
    return prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: start, lt: end } },
      _sum: { amount: true },
    });
  },

  getExpenseTotal(userId: string, start: Date, end: Date) {
    return prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
      _sum: { amount: true },
    });
  },

  getIncomeByCategory(userId: string, start: Date, end: Date) {
    return prisma.transaction.groupBy({
      by: ["category"],
      where: { userId, type: "INCOME", date: { gte: start, lt: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });
  },

  getExpenseByCategory(userId: string, start: Date, end: Date) {
    return prisma.transaction.groupBy({
      by: ["category"],
      where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });
  },

  incomeTotal(userId: string, start: Date, end: Date) {
    return this.getIncomeTotal(userId, start, end);
  },

  expenseTotal(userId: string, start: Date, end: Date) {
    return this.getExpenseTotal(userId, start, end);
  },

  incomeByCategory(userId: string, start: Date, end: Date) {
    return this.getIncomeByCategory(userId, start, end);
  },

  expenseByCategory(userId: string, start: Date, end: Date) {
    return this.getExpenseByCategory(userId, start, end);
  },
};
