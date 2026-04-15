import {
  CreateLobbyRequestDto,
  CreateLobbyResponseDto,
  GetLobbyResponseDto,
  LobbyDetailApiDto,
  LobbyListItemApiDto,
  ListLobbiesResponseDto,
  UpdateLobbyRequestDto,
  UpdateLobbyResponseDto,
} from "@/types";
import { requestJson } from "./client";

type LobbyRequestOptions = {
  signal?: AbortSignal;
};

export async function listLobbies(
  options?: LobbyRequestOptions,
): Promise<LobbyListItemApiDto[]> {
  const data = await requestJson<ListLobbiesResponseDto>("/api/lobbies", {
    method: "GET",
    cache: "no-store",
    signal: options?.signal,
  });

  return data.lobbies;
}

export async function getLobby(
  lobbyId: string,
  options?: LobbyRequestOptions,
): Promise<LobbyDetailApiDto> {
  const data = await requestJson<GetLobbyResponseDto>(`/api/lobbies/${lobbyId}`, {
    method: "GET",
    cache: "no-store",
    signal: options?.signal,
  });

  return data.lobby;
}

export async function createLobby(
  input: CreateLobbyRequestDto,
  options?: LobbyRequestOptions,
): Promise<LobbyDetailApiDto> {
  const data = await requestJson<CreateLobbyResponseDto>("/api/lobbies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal: options?.signal,
  });

  return data.lobby;
}

export async function updateLobby(
  lobbyId: string,
  input: UpdateLobbyRequestDto,
  options?: LobbyRequestOptions,
): Promise<LobbyDetailApiDto> {
  const data = await requestJson<UpdateLobbyResponseDto>(
    `/api/lobbies/${lobbyId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: options?.signal,
    },
  );

  return data.lobby;
}
