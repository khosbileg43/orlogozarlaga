jest.mock("@/lib/db/prisma", () => ({
  prisma: { $transaction: jest.fn() },
}));

jest.mock("@/server/repositories/lobby.repo", () => ({
  lobbyRepo: {
    listByUserId: jest.fn(),
    findByIdAndUserId: jest.fn(),
    createTx: jest.fn(),
    updateById: jest.fn(),
  },
}));

import { prisma } from "@/lib/db/prisma";
import { lobbyRepo } from "@/server/repositories/lobby.repo";
import { lobbyService } from "./lobby.service";

const baseMember = {
  id: "m1",
  userId: "u1",
  role: "OWNER" as const,
  status: "ACTIVE" as const,
  joinedAt: new Date("2026-04-15T10:00:00.000Z"),
  createdAt: new Date("2026-04-15T10:00:00.000Z"),
  updatedAt: new Date("2026-04-15T10:00:00.000Z"),
  user: {
    id: "u1",
    email: "owner@example.com",
    name: "Owner",
  },
};

const baseLobby = {
  id: "l1",
  name: "Trip Fund",
  description: "Summer trip",
  balance: 0,
  createdById: "u1",
  createdAt: new Date("2026-04-15T10:00:00.000Z"),
  updatedAt: new Date("2026-04-15T10:00:00.000Z"),
  members: [baseMember],
};

describe("lobbyService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists lobbies for the current user with membership metadata", async () => {
    (lobbyRepo.listByUserId as jest.Mock).mockResolvedValue([baseLobby]);

    const result = await lobbyService.listByUser("u1");

    expect(lobbyRepo.listByUserId).toHaveBeenCalledWith("u1");
    expect(result).toEqual([
      expect.objectContaining({
        id: "l1",
        role: "OWNER",
        status: "ACTIVE",
        memberCount: 1,
      }),
    ]);
  });

  it("creates a lobby and adds the creator as owner member", async () => {
    const tx = {} as never;
    (prisma.$transaction as jest.Mock).mockImplementation(async (run) => run(tx));
    (lobbyRepo.createTx as jest.Mock).mockResolvedValue(baseLobby);

    const result = await lobbyService.create("u1", {
      name: "  Trip Fund  ",
      description: "  Summer trip  ",
    });

    expect(lobbyRepo.createTx).toHaveBeenCalledWith(tx, {
      createdById: "u1",
      name: "Trip Fund",
      description: "Summer trip",
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: "l1",
        role: "OWNER",
        memberCount: 1,
      }),
    );
  });

  it("throws when a lobby is not accessible to the user", async () => {
    (lobbyRepo.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

    await expect(lobbyService.findByIdAndUserId("l1", "u1")).rejects.toThrow(
      "Lobby not found",
    );
  });

  it("prevents non-owners from updating the lobby", async () => {
    (lobbyRepo.findByIdAndUserId as jest.Mock).mockResolvedValue({
      ...baseLobby,
      members: [{ ...baseMember, role: "MEMBER" as const }],
    });

    await expect(
      lobbyService.update("u1", "l1", {
        name: "Renamed",
      }),
    ).rejects.toThrow("Only the lobby owner can update this lobby");
  });

  it("updates the lobby when the current user is the owner", async () => {
    (lobbyRepo.findByIdAndUserId as jest.Mock).mockResolvedValue(baseLobby);
    (lobbyRepo.updateById as jest.Mock).mockResolvedValue({
      ...baseLobby,
      name: "Renamed Lobby",
      description: null,
    });

    const result = await lobbyService.update("u1", "l1", {
      name: "  Renamed Lobby  ",
      description: "",
    });

    expect(lobbyRepo.updateById).toHaveBeenCalledWith("l1", {
      name: "Renamed Lobby",
      description: null,
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: "l1",
        name: "Renamed Lobby",
      }),
    );
  });
});
