import { prisma } from "@/lib/db/prisma";
import { LobbyMemberDto } from "@/types";
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  ValidationAppError,
} from "@/utils/errors";
import { lobbyMemberRepo } from "../repositories/lobby-member.repo";
import { userRepo } from "../repositories/user.repo";

type LobbyMemberRecord = Awaited<ReturnType<typeof lobbyMemberRepo.findByIdAndLobbyId>>;

function toDto(member: NonNullable<LobbyMemberRecord>): LobbyMemberDto {
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

async function requireActiveMembership(userId: string, lobbyId: string) {
  const membership = await lobbyMemberRepo.findActiveByLobbyIdAndUserId(lobbyId, userId);
  if (!membership) {
    throw new NotFoundError("Lobby not found");
  }

  return membership;
}

async function requireOwnerMembership(userId: string, lobbyId: string) {
  const membership = await requireActiveMembership(userId, lobbyId);
  if (membership.role !== "OWNER") {
    throw new ForbiddenError("Only the lobby owner can manage members");
  }

  return membership;
}

export const lobbyMemberService = {
  async listByLobbyId(userId: string, lobbyId: string) {
    await requireActiveMembership(userId, lobbyId);
    const members = await lobbyMemberRepo.listByLobbyId(lobbyId);
    return members.map((member) => toDto(member));
  },

  async findByIdAndLobbyId(userId: string, lobbyId: string, memberId: string) {
    await requireActiveMembership(userId, lobbyId);
    const member = await lobbyMemberRepo.findByIdAndLobbyId(memberId, lobbyId);
    if (!member) {
      throw new NotFoundError("Lobby member not found");
    }

    return toDto(member);
  },

  async create(
    userId: string,
    lobbyId: string,
    input: {
      userId: string;
      role: "OWNER" | "MEMBER";
    },
  ) {
    await requireOwnerMembership(userId, lobbyId);

    const targetUser = await userRepo.findById(input.userId);
    if (!targetUser) {
      throw new NotFoundError("User not found");
    }

    return prisma.$transaction(async (tx) => {
      const existing = await lobbyMemberRepo.findByLobbyIdAndUserIdTx(
        tx,
        lobbyId,
        input.userId,
      );

      if (existing?.status === "ACTIVE") {
        throw new AppError(409, "User is already an active lobby member", "CONFLICT");
      }

      if (existing) {
        const reactivated = await lobbyMemberRepo.updateByIdTx(tx, {
          memberId: existing.id,
          data: {
            role: input.role,
            status: "ACTIVE",
            joinedAt: new Date(),
          },
        });

        return toDto(reactivated);
      }

      const created = await lobbyMemberRepo.createTx(tx, {
        lobbyId,
        userId: input.userId,
        role: input.role,
      });

      return toDto(created);
    });
  },

  async remove(userId: string, lobbyId: string, memberId: string) {
    const requester = await requireActiveMembership(userId, lobbyId);

    return prisma.$transaction(async (tx) => {
      const target = await lobbyMemberRepo.findByIdAndLobbyIdTx(tx, memberId, lobbyId);
      if (!target) {
        throw new NotFoundError("Lobby member not found");
      }

      const isSelf = target.userId === userId;

      if (!isSelf && requester.role !== "OWNER") {
        throw new ForbiddenError("Only the lobby owner can remove other members");
      }

      if (target.status === "LEFT") {
        return toDto(target);
      }

      if (target.role === "OWNER") {
        const activeOwnerCount = await lobbyMemberRepo.countActiveOwnersByLobbyIdTx(
          tx,
          lobbyId,
        );
        if (activeOwnerCount <= 1) {
          throw new ValidationAppError("Lobby must have at least one active owner");
        }
      }

      const updated = await lobbyMemberRepo.updateByIdTx(tx, {
        memberId,
        data: {
          status: "LEFT",
        },
      });

      return toDto(updated);
    });
  },
};
