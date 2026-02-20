import { prisma } from "@/lib/db/prisma";

export const summaryRepo = {
  incomeTotal(userId: string, start: Date, end: Date) {
    return prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: start, lt: end } },
      _sum: { amount: true },
    });
  },

  expenseTotal(userId: string, start: Date, end: Date) {
    return prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
      _sum: { amount: true },
    });
  },

  incomeByCategory(userId: string, start: Date, end: Date) {
    return prisma.transaction.groupBy({
      by: ["category"],
      where: { userId, type: "INCOME", date: { gte: start, lt: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });
  },

  expenseByCategory(userId: string, start: Date, end: Date) {
    return prisma.transaction.groupBy({
      by: ["category"],
      where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });
  },
};
