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
};
