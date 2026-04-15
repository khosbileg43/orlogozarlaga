import { getMonthRange } from "@/lib/date/monthRange";
import { prisma } from "@/lib/db/prisma";
import {
  LobbyMemberDto,
  LobbyTransactionDto,
  LobbyTransactionTypeDto,
} from "@/types";
import {
  ForbiddenError,
  NotFoundError,
  ValidationAppError,
} from "@/utils/errors";
import { lobbyMemberRepo } from "../repositories/lobby-member.repo";
import { lobbyTransactionRepo } from "../repositories/lobby-transaction.repo";
import { lobbyRepo } from "../repositories/lobby.repo";

type LobbyMemberRecord = Awaited<
  ReturnType<typeof lobbyMemberRepo.findActiveByLobbyIdAndUserId>
>;
type LobbyTransactionRecord = Awaited<
  ReturnType<typeof lobbyTransactionRepo.findByIdAndLobbyId>
>;

function toMemberDto(member: NonNullable<LobbyMemberRecord>): LobbyMemberDto {
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

function toDto(transaction: NonNullable<LobbyTransactionRecord>): LobbyTransactionDto {
  return {
    id: transaction.id,
    lobbyId: transaction.lobbyId,
    memberId: transaction.memberId,
    type: toLobbyTransactionType(transaction.type),
    category: transaction.category,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    member: toMemberDto(transaction.member),
  };
}

function balanceEffect(type: LobbyTransactionTypeDto, amount: number) {
  if (type === "INCOME") {
    return amount;
  }
  return -amount;
}

function isLobbyTransactionType(value: string): value is LobbyTransactionTypeDto {
  return value === "INCOME" || value === "EXPENSE";
}

function toLobbyTransactionType(value: string): LobbyTransactionTypeDto {
  if (isLobbyTransactionType(value)) {
    return value;
  }

  throw new ValidationAppError("Lobby transactions only support INCOME and EXPENSE");
}

async function requireActiveMembership(userId: string, lobbyId: string) {
  const membership = await lobbyMemberRepo.findActiveByLobbyIdAndUserId(lobbyId, userId);
  if (!membership) {
    throw new NotFoundError("Lobby not found");
  }

  return membership;
}

function assertOwnerTransactionAccess(requester: NonNullable<LobbyMemberRecord>) {
  if (requester.role !== "OWNER") {
    throw new ForbiddenError("Only the lobby owner can manage lobby transactions");
  }
}

function assertCreateTransactionAccess(
  requester: NonNullable<LobbyMemberRecord>,
  memberId: string,
) {
  if (requester.role === "OWNER" || requester.id === memberId) {
    return;
  }

  throw new ForbiddenError(
    "Only the lobby owner can create transactions for other members",
  );
}

export const lobbyTransactionService = {
  async list(args: {
    userId: string;
    lobbyId: string;
    month?: string;
    type?: string | null;
    page?: number;
    limit?: number;
  }) {
    await requireActiveMembership(args.userId, args.lobbyId);

    const normalizedType =
      args.type && isLobbyTransactionType(args.type) ? args.type : undefined;

    if (args.type && !normalizedType) {
      throw new ValidationAppError(
        "Invalid transaction type. Use INCOME or EXPENSE",
      );
    }

    const page = args.page ?? 1;
    const limit = args.limit ?? 50;
    const offset = (page - 1) * limit;
    const monthRange = args.month ? getMonthRange(args.month) : undefined;

    const transactions = await lobbyTransactionRepo.findManyByLobbyId({
      lobbyId: args.lobbyId,
      offset,
      limit,
      ...(monthRange ? { start: monthRange.start, end: monthRange.end } : {}),
      ...(normalizedType ? { type: normalizedType } : {}),
    });

    return transactions.map((transaction) => toDto(transaction));
  },

  async findByIdAndLobbyId(userId: string, lobbyId: string, transactionId: string) {
    await requireActiveMembership(userId, lobbyId);

    const transaction = await lobbyTransactionRepo.findByIdAndLobbyId(
      transactionId,
      lobbyId,
    );
    if (!transaction) {
      throw new NotFoundError("Lobby transaction not found");
    }

    return toDto(transaction);
  },

  async create(
    userId: string,
    lobbyId: string,
    input: {
      memberId: string;
      type: LobbyTransactionTypeDto;
      category: string;
      amount: number;
      description?: string | null;
      date: Date;
    },
  ) {
    const requester = await requireActiveMembership(userId, lobbyId);

    return prisma.$transaction(async (tx) => {
      const member = await lobbyMemberRepo.findByIdAndLobbyIdTx(
        tx,
        input.memberId,
        lobbyId,
      );
      if (!member || member.status !== "ACTIVE") {
        throw new NotFoundError("Lobby member not found");
      }

      assertCreateTransactionAccess(requester, member.id);

      const delta = balanceEffect(input.type, input.amount);
      const updated = await lobbyRepo.incrementBalanceByIdTx(tx, {
        lobbyId,
        by: delta,
      });
      if (updated.count === 0) {
        throw new NotFoundError("Lobby not found");
      }

      const created = await lobbyTransactionRepo.createTx(tx, {
        lobbyId,
        memberId: input.memberId,
        type: input.type,
        category: input.category.trim(),
        amount: input.amount,
        description: input.description?.trim() || null,
        date: input.date,
      });

      return toDto(created);
    });
  },

  async update(
    userId: string,
    lobbyId: string,
    transactionId: string,
    input: {
      memberId?: string;
      type?: LobbyTransactionTypeDto;
      category?: string;
      amount?: number;
      description?: string | null;
      date?: Date;
    },
  ) {
    const requester = await requireActiveMembership(userId, lobbyId);
    assertOwnerTransactionAccess(requester);

    return prisma.$transaction(async (tx) => {
      const existing = await lobbyTransactionRepo.findByIdAndLobbyIdTx(
        tx,
        transactionId,
        lobbyId,
      );
      if (!existing) {
        throw new NotFoundError("Lobby transaction not found");
      }

      const nextMemberId = input.memberId ?? existing.memberId;

      const nextMember = await lobbyMemberRepo.findByIdAndLobbyIdTx(
        tx,
        nextMemberId,
        lobbyId,
      );
      if (!nextMember || nextMember.status !== "ACTIVE") {
        throw new NotFoundError("Lobby member not found");
      }

      const nextType = input.type ?? toLobbyTransactionType(existing.type);
      const nextAmount = input.amount ?? existing.amount;
      const delta =
        balanceEffect(nextType, nextAmount) -
        balanceEffect(toLobbyTransactionType(existing.type), existing.amount);

      const updatedLobby = await lobbyRepo.incrementBalanceByIdTx(tx, {
        lobbyId,
        by: delta,
      });
      if (updatedLobby.count === 0) {
        throw new NotFoundError("Lobby not found");
      }

      const updated = await lobbyTransactionRepo.updateByIdTx(tx, {
        id: transactionId,
        data: {
          ...(typeof input.memberId !== "undefined" ? { memberId: input.memberId } : {}),
          ...(typeof input.type !== "undefined" ? { type: input.type } : {}),
          ...(typeof input.category !== "undefined"
            ? { category: input.category.trim() }
            : {}),
          ...(typeof input.amount !== "undefined" ? { amount: input.amount } : {}),
          ...(typeof input.description !== "undefined"
            ? { description: input.description?.trim() || null }
            : {}),
          ...(typeof input.date !== "undefined" ? { date: input.date } : {}),
        },
      });

      return toDto(updated);
    });
  },

  async delete(userId: string, lobbyId: string, transactionId: string) {
    const requester = await requireActiveMembership(userId, lobbyId);
    assertOwnerTransactionAccess(requester);

    return prisma.$transaction(async (tx) => {
      const existing = await lobbyTransactionRepo.findByIdAndLobbyIdTx(
        tx,
        transactionId,
        lobbyId,
      );
      if (!existing) {
        throw new NotFoundError("Lobby transaction not found");
      }

      const rollback =
        -balanceEffect(toLobbyTransactionType(existing.type), existing.amount);
      const updatedLobby = await lobbyRepo.incrementBalanceByIdTx(tx, {
        lobbyId,
        by: rollback,
      });
      if (updatedLobby.count === 0) {
        throw new NotFoundError("Lobby not found");
      }

      const deleted = await lobbyTransactionRepo.deleteByIdTx(tx, transactionId);
      return toDto(deleted);
    });
  },
};
