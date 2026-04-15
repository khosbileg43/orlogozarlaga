import { prisma } from "@/lib/db/prisma";
import { LobbyDetailDto, LobbyListItemDto } from "@/types";
import { ForbiddenError, NotFoundError } from "@/utils/errors";
import { lobbyRepo } from "../repositories/lobby.repo";

type LobbyRecord = Awaited<ReturnType<typeof lobbyRepo.findByIdAndUserId>>;
type LobbyListRecord = Awaited<ReturnType<typeof lobbyRepo.listByUserId>>[number];

function toListItem(lobby: LobbyListRecord, userId: string): LobbyListItemDto {
  const membership = lobby.members.find((member) => member.userId === userId);

  if (!membership) {
    throw new NotFoundError("Lobby not found");
  }

  return {
    id: lobby.id,
    name: lobby.name,
    description: lobby.description,
    balance: lobby.balance,
    createdById: lobby.createdById,
    role: membership.role,
    status: membership.status,
    memberCount: lobby.members.filter((member) => member.status === "ACTIVE").length,
    createdAt: lobby.createdAt,
    updatedAt: lobby.updatedAt,
  };
}

function toDetail(lobby: NonNullable<LobbyRecord>, userId: string): LobbyDetailDto {
  return {
    ...toListItem(lobby, userId),
    members: lobby.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: member.user,
    })),
  };
}

export const lobbyService = {
  async listByUser(userId: string) {
    const lobbies = await lobbyRepo.listByUserId(userId);
    return lobbies.map((lobby) => toListItem(lobby, userId));
  },

  async findByIdAndUserId(lobbyId: string, userId: string) {
    const lobby = await lobbyRepo.findByIdAndUserId(lobbyId, userId);
    if (!lobby) {
      throw new NotFoundError("Lobby not found");
    }

    return toDetail(lobby, userId);
  },

  async create(
    userId: string,
    input: {
      name: string;
      description?: string | null;
    },
  ) {
    const name = input.name.trim();
    const description = input.description?.trim() || null;

    const lobby = await prisma.$transaction((tx) =>
      lobbyRepo.createTx(tx, {
        createdById: userId,
        name,
        description,
      }),
    );

    return toDetail(lobby, userId);
  },

  async update(
    userId: string,
    lobbyId: string,
    input: {
      name?: string;
      description?: string | null;
    },
  ) {
    const existing = await lobbyRepo.findByIdAndUserId(lobbyId, userId);
    if (!existing) {
      throw new NotFoundError("Lobby not found");
    }

    const membership = existing.members.find((member) => member.userId === userId);
    if (!membership) {
      throw new NotFoundError("Lobby not found");
    }

    if (membership.role !== "OWNER") {
      throw new ForbiddenError("Only the lobby owner can update this lobby");
    }

    const updated = await lobbyRepo.updateById(lobbyId, {
      ...(typeof input.name !== "undefined" ? { name: input.name.trim() } : {}),
      ...(typeof input.description !== "undefined"
        ? { description: input.description?.trim() || null }
        : {}),
    });

    return toDetail(updated, userId);
  },
};
