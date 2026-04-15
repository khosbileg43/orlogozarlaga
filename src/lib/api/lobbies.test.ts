import { ApiClientError } from "./client";
import { createLobby, getLobby, listLobbies, updateLobby } from "./lobbies";

describe("lobbies api client", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("lists lobbies from the shared api envelope", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            lobbies: [
              {
                id: "l1",
                name: "Trip Fund",
                description: null,
                balance: 0,
                createdById: "u1",
                role: "OWNER",
                status: "ACTIVE",
                memberCount: 1,
                createdAt: "2026-04-15T11:30:00.000Z",
                updatedAt: "2026-04-15T11:30:00.000Z",
              },
            ],
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await listLobbies();

    expect(fetchMock).toHaveBeenCalledWith("/api/lobbies", {
      method: "GET",
      cache: "no-store",
      signal: undefined,
    });
    expect(result).toEqual([
      expect.objectContaining({
        id: "l1",
        role: "OWNER",
      }),
    ]);
  });

  it("creates a lobby and returns the created lobby payload", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            lobby: {
              id: "l1",
              name: "Trip Fund",
              description: "Budget",
              balance: 0,
              createdById: "u1",
              role: "OWNER",
              status: "ACTIVE",
              memberCount: 1,
              createdAt: "2026-04-15T11:30:00.000Z",
              updatedAt: "2026-04-15T11:30:00.000Z",
              members: [],
            },
          },
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await createLobby({
      name: "Trip Fund",
      description: "Budget",
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: "l1",
        name: "Trip Fund",
      }),
    );
  });

  it("fetches a single lobby by id", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            lobby: {
              id: "l1",
              name: "Trip Fund",
              description: null,
              balance: 0,
              createdById: "u1",
              role: "OWNER",
              status: "ACTIVE",
              memberCount: 1,
              createdAt: "2026-04-15T11:30:00.000Z",
              updatedAt: "2026-04-15T11:30:00.000Z",
              members: [],
            },
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await getLobby("l1");

    expect(result.id).toBe("l1");
  });

  it("updates a lobby by id", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            lobby: {
              id: "l1",
              name: "Renamed Lobby",
              description: null,
              balance: 0,
              createdById: "u1",
              role: "OWNER",
              status: "ACTIVE",
              memberCount: 1,
              createdAt: "2026-04-15T11:30:00.000Z",
              updatedAt: "2026-04-15T11:35:00.000Z",
              members: [],
            },
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await updateLobby("l1", { name: "Renamed Lobby" });

    expect(fetchMock).toHaveBeenCalledWith("/api/lobbies/l1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Renamed Lobby" }),
      signal: undefined,
    });
    expect(result.name).toBe("Renamed Lobby");
  });

  it("throws ApiClientError on failed responses", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: "FORBIDDEN",
          message: "Only the lobby owner can update this lobby",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await expect(updateLobby("l1", { name: "Renamed Lobby" })).rejects.toEqual(
      expect.objectContaining<ApiClientError>({
        name: "ApiClientError",
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });
});
