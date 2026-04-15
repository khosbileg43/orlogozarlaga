import { getMonthRange } from "@/lib/date/monthRange";
import { LobbyMemberSummaryDto, LobbySummaryDto } from "@/types";
import { NotFoundError } from "@/utils/errors";
import { lobbyMemberRepo } from "../repositories/lobby-member.repo";
import { lobbyRepo } from "../repositories/lobby.repo";
import { lobbySummaryRepo } from "../repositories/lobby-summary.repo";

async function requireLobbyAccess(userId: string, lobbyId: string) {
  const membership = await lobbyMemberRepo.findActiveByLobbyIdAndUserId(lobbyId, userId);
  if (!membership) {
    throw new NotFoundError("Lobby not found");
  }
}

export const lobbySummaryService = {
  async getSummary(args: { userId: string; lobbyId: string; month?: string }) {
    await requireLobbyAccess(args.userId, args.lobbyId);

    const range = args.month ? getMonthRange(args.month) : undefined;
    const lobby = await lobbyRepo.findByIdAndUserId(args.lobbyId, args.userId);
    if (!lobby) {
      throw new NotFoundError("Lobby not found");
    }

    const [incomeAgg, expenseAgg, incomeCats, expenseCats] = await Promise.all([
      lobbySummaryRepo.getIncomeTotal(
        args.lobbyId,
        range?.start,
        range?.end,
      ),
      lobbySummaryRepo.getExpenseTotal(
        args.lobbyId,
        range?.start,
        range?.end,
      ),
      lobbySummaryRepo.getIncomeByCategory(
        args.lobbyId,
        range?.start,
        range?.end,
      ),
      lobbySummaryRepo.getExpenseByCategory(
        args.lobbyId,
        range?.start,
        range?.end,
      ),
    ]);

    const summary: LobbySummaryDto = {
      balanceTotal: lobby.balance,
      incomeTotal: incomeAgg._sum.amount ?? 0,
      expenseTotal: expenseAgg._sum.amount ?? 0,
      incomeByCategory: incomeCats.map((item) => ({
        category: item.category,
        amount: item._sum.amount ?? 0,
      })),
      expenseByCategory: expenseCats.map((item) => ({
        category: item.category,
        amount: item._sum.amount ?? 0,
      })),
    };

    return summary;
  },

  async getMemberSummary(args: { userId: string; lobbyId: string; month?: string }) {
    await requireLobbyAccess(args.userId, args.lobbyId);

    const range = args.month ? getMonthRange(args.month) : undefined;
    const [members, transactions] = await Promise.all([
      lobbyMemberRepo.listByLobbyId(args.lobbyId),
      lobbySummaryRepo.getTransactionsForMemberSummary(
        args.lobbyId,
        range?.start,
        range?.end,
      ),
    ]);

    const summaryMap = new Map<string, LobbyMemberSummaryDto>(
      members.map((member) => [
        member.id,
        {
          memberId: member.id,
          userId: member.userId,
          role: member.role,
          status: member.status,
          name: member.user.name,
          email: member.user.email,
          incomeTotal: 0,
          expenseTotal: 0,
          netTotal: 0,
          transactionCount: 0,
        },
      ]),
    );

    for (const transaction of transactions) {
      const current =
        summaryMap.get(transaction.memberId) ??
        {
          memberId: transaction.member.id,
          userId: transaction.member.userId,
          role: transaction.member.role,
          status: transaction.member.status,
          name: transaction.member.user.name,
          email: transaction.member.user.email,
          incomeTotal: 0,
          expenseTotal: 0,
          netTotal: 0,
          transactionCount: 0,
        };

      if (transaction.type === "INCOME") {
        current.incomeTotal += transaction.amount;
        current.netTotal += transaction.amount;
      } else if (transaction.type === "EXPENSE") {
        current.expenseTotal += transaction.amount;
        current.netTotal -= transaction.amount;
      }

      current.transactionCount += 1;
      summaryMap.set(transaction.memberId, current);
    }

    return Array.from(summaryMap.values()).sort((a, b) => b.netTotal - a.netTotal);
  },
};
