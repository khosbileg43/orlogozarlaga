import { prisma } from "@/lib/db/prisma";

export const lobbySummaryRepo = {
  getIncomeTotal(lobbyId: string, start?: Date, end?: Date) {
    return prisma.lobbyTransaction.aggregate({
      where: {
        lobbyId,
        type: "INCOME",
        ...(start && end ? { date: { gte: start, lt: end } } : {}),
      },
      _sum: { amount: true },
    });
  },

  getExpenseTotal(lobbyId: string, start?: Date, end?: Date) {
    return prisma.lobbyTransaction.aggregate({
      where: {
        lobbyId,
        type: "EXPENSE",
        ...(start && end ? { date: { gte: start, lt: end } } : {}),
      },
      _sum: { amount: true },
    });
  },

  getIncomeByCategory(lobbyId: string, start?: Date, end?: Date) {
    return prisma.lobbyTransaction.groupBy({
      by: ["category"],
      where: {
        lobbyId,
        type: "INCOME",
        ...(start && end ? { date: { gte: start, lt: end } } : {}),
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });
  },

  getExpenseByCategory(lobbyId: string, start?: Date, end?: Date) {
    return prisma.lobbyTransaction.groupBy({
      by: ["category"],
      where: {
        lobbyId,
        type: "EXPENSE",
        ...(start && end ? { date: { gte: start, lt: end } } : {}),
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });
  },

  getTransactionsForMemberSummary(lobbyId: string, start?: Date, end?: Date) {
    return prisma.lobbyTransaction.findMany({
      where: {
        lobbyId,
        type: {
          in: ["INCOME", "EXPENSE"],
        },
        ...(start && end ? { date: { gte: start, lt: end } } : {}),
      },
      select: {
        id: true,
        memberId: true,
        type: true,
        amount: true,
        member: {
          select: {
            id: true,
            userId: true,
            role: true,
            status: true,
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },

  listRecentTransactions(lobbyId: string, start?: Date, end?: Date, limit = 5) {
    return prisma.lobbyTransaction.findMany({
      where: {
        lobbyId,
        type: {
          in: ["INCOME", "EXPENSE"],
        },
        ...(start && end ? { date: { gte: start, lt: end } } : {}),
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        type: true,
        category: true,
        amount: true,
        date: true,
        member: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  },
};
