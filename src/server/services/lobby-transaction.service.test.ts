jest.mock("@/lib/db/prisma", () => ({
  prisma: { $transaction: jest.fn() },
}));

jest.mock("@/server/repositories/lobby-member.repo", () => ({
  lobbyMemberRepo: {
    findActiveByLobbyIdAndUserId: jest.fn(),
    findByIdAndLobbyIdTx: jest.fn(),
  },
}));

jest.mock("@/server/repositories/lobby-transaction.repo", () => ({
  lobbyTransactionRepo: {
    findByIdAndLobbyIdTx: jest.fn(),
    updateByIdTx: jest.fn(),
    deleteByIdTx: jest.fn(),
  },
}));

jest.mock("@/server/repositories/lobby.repo", () => ({
  lobbyRepo: {
    incrementBalanceByIdTx: jest.fn(),
  },
}));

jest.mock("@/server/repositories/account.repo", () => ({
  accountRepo: {
    incrementBalanceIfOwnedTx: jest.fn(),
    decrementBalanceIfOwnedAndSufficientTx: jest.fn(),
  },
}));

jest.mock("@/server/repositories/transaction.repo", () => ({
  transactionRepo: {
    findByIdTx: jest.fn(),
    updateByIdAndUserIdTx: jest.fn(),
    deleteByIdAndUserIdTx: jest.fn(),
  },
}));

import { prisma } from "@/lib/db/prisma";
import { accountRepo } from "@/server/repositories/account.repo";
import { lobbyMemberRepo } from "@/server/repositories/lobby-member.repo";
import { lobbyRepo } from "@/server/repositories/lobby.repo";
import { lobbyTransactionRepo } from "@/server/repositories/lobby-transaction.repo";
import { transactionRepo } from "@/server/repositories/transaction.repo";
import { lobbyTransactionService } from "./lobby-transaction.service";

describe("lobbyTransactionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates linked pocket transfer transactions and syncs the personal side", async () => {
    const tx = {} as never;
    const date = new Date("2026-04-17T00:00:00.000Z");
    const requester = {
      id: "member_owner",
      userId: "owner_user",
      role: "OWNER" as const,
      status: "ACTIVE" as const,
      joinedAt: date,
      createdAt: date,
      updatedAt: date,
      user: {
        id: "owner_user",
        email: "owner@example.com",
        name: "Owner",
      },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (run) => run(tx));
    (lobbyMemberRepo.findActiveByLobbyIdAndUserId as jest.Mock).mockResolvedValue(requester);
    (lobbyTransactionRepo.findByIdAndLobbyIdTx as jest.Mock).mockResolvedValue({
      id: "ltx_1",
      lobbyId: "lobby_1",
      memberId: "member_1",
      personalTransactionId: "ptx_1",
      type: "INCOME",
      category: "Pocket Transfer",
      amount: 50000,
      description: "April contribution",
      date,
      createdAt: date,
      updatedAt: date,
      member: {
        id: "member_1",
        userId: "u1",
        role: "MEMBER",
        status: "ACTIVE",
        joinedAt: date,
        createdAt: date,
        updatedAt: date,
        user: {
          id: "u1",
          email: "user@example.com",
          name: "User",
        },
      },
    });
    (transactionRepo.findByIdTx as jest.Mock).mockResolvedValue({
      id: "ptx_1",
      userId: "u1",
      accountId: "acc_1",
      toAccountId: null,
      lobbyId: "lobby_1",
      type: "TRANSFER",
      category: "Lobby Transfer",
      amount: 50000,
      description: "April contribution",
      date,
    });
    (lobbyMemberRepo.findByIdAndLobbyIdTx as jest.Mock).mockResolvedValue({
      id: "member_1",
      userId: "u1",
      role: "MEMBER",
      status: "ACTIVE",
      joinedAt: date,
      createdAt: date,
      updatedAt: date,
      user: {
        id: "u1",
        email: "user@example.com",
        name: "User",
      },
    });
    (lobbyRepo.incrementBalanceByIdTx as jest.Mock).mockResolvedValue({ count: 1 });
    (accountRepo.incrementBalanceIfOwnedTx as jest.Mock).mockResolvedValue({ count: 1 });
    (transactionRepo.updateByIdAndUserIdTx as jest.Mock).mockResolvedValue({
      id: "ptx_1",
    });
    (lobbyTransactionRepo.updateByIdTx as jest.Mock).mockResolvedValue({
      id: "ltx_1",
      lobbyId: "lobby_1",
      memberId: "member_1",
      personalTransactionId: "ptx_1",
      type: "INCOME",
      category: "Pocket Transfer",
      amount: 40000,
      description: "Adjusted contribution",
      date,
      createdAt: date,
      updatedAt: date,
      member: {
        id: "member_1",
        userId: "u1",
        role: "MEMBER",
        status: "ACTIVE",
        joinedAt: date,
        createdAt: date,
        updatedAt: date,
        user: {
          id: "u1",
          email: "user@example.com",
          name: "User",
        },
      },
    });

    const result = await lobbyTransactionService.update("owner_user", "lobby_1", "ltx_1", {
      amount: 40000,
      description: "Adjusted contribution",
    });

    expect(accountRepo.incrementBalanceIfOwnedTx).toHaveBeenCalledWith(tx, {
      accountId: "acc_1",
      userId: "u1",
      by: 10000,
    });
    expect(transactionRepo.updateByIdAndUserIdTx).toHaveBeenCalledWith(tx, {
      id: "ptx_1",
      userId: "u1",
      data: {
        amount: 40000,
        description: "Adjusted contribution",
      },
    });
    expect(result.amount).toBe(40000);
  });
});
