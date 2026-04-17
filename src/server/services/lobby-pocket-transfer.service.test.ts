jest.mock("@/lib/db/prisma", () => ({
  prisma: { $transaction: jest.fn() },
}));

jest.mock("@/server/repositories/account.repo", () => ({
  accountRepo: {
    findByIdAndUserIdTx: jest.fn(),
    decrementBalanceIfOwnedAndSufficientTx: jest.fn(),
  },
}));

jest.mock("@/server/repositories/lobby.repo", () => ({
  lobbyRepo: {
    findByIdTx: jest.fn(),
    incrementBalanceByIdTx: jest.fn(),
  },
}));

jest.mock("@/server/repositories/lobby-member.repo", () => ({
  lobbyMemberRepo: {
    findByIdAndLobbyIdTx: jest.fn(),
  },
}));

jest.mock("@/server/repositories/transaction.repo", () => ({
  transactionRepo: {
    createTx: jest.fn(),
  },
}));

jest.mock("@/server/repositories/lobby-transaction.repo", () => ({
  lobbyTransactionRepo: {
    createTx: jest.fn(),
  },
}));

import { prisma } from "@/lib/db/prisma";
import { accountRepo } from "@/server/repositories/account.repo";
import { lobbyMemberRepo } from "@/server/repositories/lobby-member.repo";
import { lobbyRepo } from "@/server/repositories/lobby.repo";
import { lobbyTransactionRepo } from "@/server/repositories/lobby-transaction.repo";
import { transactionRepo } from "@/server/repositories/transaction.repo";
import { lobbyPocketTransferService } from "./lobby-pocket-transfer.service";

describe("lobbyPocketTransferService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates personal and lobby transactions and updates both balances atomically", async () => {
    const tx = {} as never;
    const date = new Date("2026-04-15T00:00:00.000Z");

    (prisma.$transaction as jest.Mock).mockImplementation(async (run) => run(tx));
    (accountRepo.findByIdAndUserIdTx as jest.Mock)
      .mockResolvedValueOnce({
        id: "acc_1",
        name: "Cash",
        balance: 100000,
        userId: "u1",
      })
      .mockResolvedValueOnce({
        id: "acc_1",
        name: "Cash",
        balance: 80000,
        userId: "u1",
      });
    (lobbyRepo.findByIdTx as jest.Mock)
      .mockResolvedValueOnce({
        id: "lobby_1",
        name: "April Fund",
        description: null,
        balance: 20000,
        createdById: "u1",
        createdAt: date,
        updatedAt: date,
      })
      .mockResolvedValueOnce({
        id: "lobby_1",
        name: "April Fund",
        description: null,
        balance: 40000,
        createdById: "u1",
        createdAt: date,
        updatedAt: date,
      });
    (lobbyMemberRepo.findByIdAndLobbyIdTx as jest.Mock).mockResolvedValue({
      id: "member_1",
      lobbyId: "lobby_1",
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
    (accountRepo.decrementBalanceIfOwnedAndSufficientTx as jest.Mock).mockResolvedValue({
      count: 1,
    });
    (transactionRepo.createTx as jest.Mock).mockResolvedValue({
      id: "ptx_1",
      accountId: "acc_1",
      toAccountId: null,
      lobbyId: "lobby_1",
      type: "TRANSFER",
      category: "Lobby Transfer",
      amount: 20000,
      description: "April contribution",
      date,
    });
    (lobbyRepo.incrementBalanceByIdTx as jest.Mock).mockResolvedValue({ count: 1 });
    (lobbyTransactionRepo.createTx as jest.Mock).mockResolvedValue({
      id: "ltx_1",
      lobbyId: "lobby_1",
      memberId: "member_1",
      type: "INCOME",
      category: "Pocket Transfer",
      amount: 20000,
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

    const result = await lobbyPocketTransferService.create("u1", "lobby_1", {
      accountId: "acc_1",
      memberId: "member_1",
      amount: 20000,
      description: "April contribution",
      date,
    });

    expect(accountRepo.decrementBalanceIfOwnedAndSufficientTx).toHaveBeenCalledWith(tx, {
      accountId: "acc_1",
      userId: "u1",
      amount: 20000,
    });
    expect(transactionRepo.createTx).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        accountId: "acc_1",
        lobbyId: "lobby_1",
        type: "TRANSFER",
        category: "Lobby Transfer",
      }),
    );
    expect(lobbyTransactionRepo.createTx).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        lobbyId: "lobby_1",
        memberId: "member_1",
        type: "INCOME",
        category: "Pocket Transfer",
      }),
    );
    expect(result.balances).toEqual({
      accountBalance: 80000,
      lobbyBalance: 40000,
    });
  });

  it("rejects transfers into another user's membership", async () => {
    const tx = {} as never;
    const date = new Date("2026-04-15T00:00:00.000Z");

    (prisma.$transaction as jest.Mock).mockImplementation(async (run) => run(tx));
    (accountRepo.findByIdAndUserIdTx as jest.Mock).mockResolvedValue({
      id: "acc_1",
      name: "Cash",
      balance: 100000,
      userId: "u1",
    });
    (lobbyRepo.findByIdTx as jest.Mock).mockResolvedValue({
      id: "lobby_1",
      name: "April Fund",
      description: null,
      balance: 20000,
      createdById: "u1",
      createdAt: date,
      updatedAt: date,
    });
    (lobbyMemberRepo.findByIdAndLobbyIdTx as jest.Mock).mockResolvedValue({
      id: "member_2",
      lobbyId: "lobby_1",
      userId: "u2",
      role: "MEMBER",
      status: "ACTIVE",
      joinedAt: date,
      createdAt: date,
      updatedAt: date,
      user: {
        id: "u2",
        email: "other@example.com",
        name: "Other",
      },
    });

    await expect(
      lobbyPocketTransferService.create("u1", "lobby_1", {
        accountId: "acc_1",
        memberId: "member_2",
        amount: 20000,
        date,
      }),
    ).rejects.toThrow("You can only transfer into your own lobby membership");
  });
});
