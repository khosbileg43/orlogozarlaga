import { prisma } from "@/lib/db/prisma";
import { LobbyTransactionDto, TransactionDto } from "@/types";
import {
  ForbiddenError,
  NotFoundError,
  ValidationAppError,
} from "@/utils/errors";
import { accountRepo } from "../repositories/account.repo";
import { lobbyMemberRepo } from "../repositories/lobby-member.repo";
import { lobbyRepo } from "../repositories/lobby.repo";
import { lobbyTransactionRepo } from "../repositories/lobby-transaction.repo";
import { transactionRepo } from "../repositories/transaction.repo";

const PERSONAL_TRANSFER_CATEGORY = "Lobby Transfer";
const LOBBY_TRANSFER_CATEGORY = "Pocket Transfer";

type LobbyMemberRecord = Awaited<ReturnType<typeof lobbyMemberRepo.findByIdAndLobbyIdTx>>;
type PersonalTransactionRecord = Awaited<ReturnType<typeof transactionRepo.createTx>>;
type LobbyTransactionRecord = Awaited<ReturnType<typeof lobbyTransactionRepo.createTx>>;

function toTransactionDto(
  transaction: NonNullable<PersonalTransactionRecord>,
): TransactionDto {
  return {
    id: transaction.id,
    accountId: transaction.accountId,
    toAccountId: transaction.toAccountId,
    lobbyId: transaction.lobbyId,
    type: transaction.type,
    category: transaction.category,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
  };
}

function toLobbyMemberDto(member: NonNullable<LobbyMemberRecord>) {
  return {
    id: member.id,
    userId: member.userId,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    user: member.user,
  };
}

function toLobbyTransactionDto(
  transaction: NonNullable<LobbyTransactionRecord>,
): LobbyTransactionDto {
  return {
    id: transaction.id,
    lobbyId: transaction.lobbyId,
    memberId: transaction.memberId,
    type: transaction.type === "EXPENSE" ? "EXPENSE" : "INCOME",
    category: transaction.category,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    member: toLobbyMemberDto(transaction.member),
  };
}

async function requireLobby(tx: Parameters<typeof lobbyRepo.findByIdTx>[0], lobbyId: string) {
  const lobby = await lobbyRepo.findByIdTx(tx, lobbyId);
  if (!lobby) {
    throw new NotFoundError("Lobby not found");
  }

  return lobby;
}

async function requireOwnedAccount(
  tx: Parameters<typeof accountRepo.findByIdAndUserIdTx>[0],
  accountId: string,
  userId: string,
) {
  const account = await accountRepo.findByIdAndUserIdTx(tx, accountId, userId);
  if (!account) {
    throw new NotFoundError("Account not found");
  }

  return account;
}

async function requireCurrentUserMember(
  tx: Parameters<typeof lobbyMemberRepo.findByIdAndLobbyIdTx>[0],
  lobbyId: string,
  memberId: string,
  userId: string,
) {
  const member = await lobbyMemberRepo.findByIdAndLobbyIdTx(tx, memberId, lobbyId);
  if (!member || member.status !== "ACTIVE") {
    throw new NotFoundError("Lobby member not found");
  }

  if (member.userId !== userId) {
    throw new ForbiddenError("You can only transfer into your own lobby membership");
  }

  return member;
}

export const lobbyPocketTransferService = {
  async create(
    userId: string,
    lobbyId: string,
    input: {
      accountId: string;
      memberId: string;
      amount: number;
      description?: string | null;
      date: Date;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      const [account, lobby] = await Promise.all([
        requireOwnedAccount(tx, input.accountId, userId),
        requireLobby(tx, lobbyId),
      ]);

      await requireCurrentUserMember(tx, lobbyId, input.memberId, userId);

      if (account.balance < input.amount) {
        throw new ValidationAppError("Insufficient account balance");
      }

      const accountUpdated = await accountRepo.decrementBalanceIfOwnedAndSufficientTx(tx, {
        accountId: input.accountId,
        userId,
        amount: input.amount,
      });

      if (accountUpdated.count === 0) {
        throw new ValidationAppError("Insufficient account balance");
      }

      const normalizedDescription = input.description?.trim() || null;

      const personalTransaction = await transactionRepo.createTx(tx, {
        userId,
        accountId: input.accountId,
        lobbyId,
        type: "TRANSFER",
        category: PERSONAL_TRANSFER_CATEGORY,
        amount: input.amount,
        description: normalizedDescription,
        date: input.date,
      });

      const lobbyUpdated = await lobbyRepo.incrementBalanceByIdTx(tx, {
        lobbyId,
        by: input.amount,
      });

      if (lobbyUpdated.count === 0) {
        throw new NotFoundError("Lobby not found");
      }

      const lobbyTransaction = await lobbyTransactionRepo.createTx(tx, {
        lobbyId,
        memberId: input.memberId,
        personalTransactionId: personalTransaction.id,
        type: "INCOME",
        category: LOBBY_TRANSFER_CATEGORY,
        amount: input.amount,
        description: normalizedDescription,
        date: input.date,
      });

      const [nextAccount, nextLobby] = await Promise.all([
        requireOwnedAccount(tx, input.accountId, userId),
        requireLobby(tx, lobby.id),
      ]);

      return {
        personalTransaction: toTransactionDto(personalTransaction),
        lobbyTransaction: toLobbyTransactionDto(lobbyTransaction),
        balances: {
          accountBalance: nextAccount.balance,
          lobbyBalance: nextLobby.balance,
        },
      };
    });
  },
};
