import type {
  ApiResponse,
  CreateLobbyRequestDto,
  CreateLobbyResponseDto,
  CreateLobbyMemberRequestDto,
  CreateLobbyMemberResponseDto,
  CreateLobbyTransactionRequestDto,
  CreateLobbyTransactionResponseDto,
  GetLobbyMemberSummaryResponseDto,
  GetLobbyResponseDto,
  GetLobbySummaryResponseDto,
  ListLobbiesResponseDto,
  ListLobbyMembersResponseDto,
  ListLobbyTransactionsResponseDto,
  UpdateLobbyRequestDto,
  UpdateLobbyResponseDto,
  UpdateLobbyTransactionRequestDto,
  UpdateLobbyTransactionResponseDto,
  GetLobbyTransactionResponseDto,
} from "@/types";
import type {
  CreateLobbyTransactionInput,
  LobbyDetail,
  LobbyListItem,
  LobbyMember,
  LobbyMemberContribution,
  LobbySummary,
  LobbyTransaction,
  UpdateLobbyTransactionInput,
} from "./types";

function getErrorMessage(
  response: Response,
  payload: { message?: string; error?: string } | null,
  context: string,
) {
  const code = payload?.error ? ` ${payload.error}` : "";
  const message = payload?.message || payload?.error || "Request failed";
  return `${context} failed (${response.status}${code}): ${message}`;
}

function mapLobbyListItem(lobby: ListLobbiesResponseDto["lobbies"][number]): LobbyListItem {
  return {
    id: lobby.id,
    name: lobby.name,
    description: lobby.description,
    balance: lobby.balance,
    createdById: lobby.createdById,
    role: lobby.role,
    status: lobby.status,
    memberCount: lobby.memberCount,
    createdAt: lobby.createdAt,
    updatedAt: lobby.updatedAt,
  };
}

function mapLobbyMember(
  lobbyId: string,
  member: ListLobbyMembersResponseDto["members"][number],
): LobbyMember {
  return {
    id: member.id,
    lobbyId,
    userId: member.userId,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
    },
  };
}

function mapLobbyDetail(lobby: GetLobbyResponseDto["lobby"]): LobbyDetail {
  return {
    ...mapLobbyListItem(lobby),
    members: lobby.members.map((member) => mapLobbyMember(lobby.id, member)),
  };
}

function mapLobbyTransaction(
  transaction: ListLobbyTransactionsResponseDto["transactions"][number],
): LobbyTransaction {
  return {
    id: transaction.id,
    lobbyId: transaction.lobbyId,
    memberId: transaction.memberId,
    type: transaction.type,
    category: transaction.category,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    member: {
      id: transaction.member.id,
      role: transaction.member.role,
      user: {
        id: transaction.member.user.id,
        name: transaction.member.user.name,
        email: transaction.member.user.email,
      },
    },
  };
}

function mapLobbySummary(summary: GetLobbySummaryResponseDto["summary"]): LobbySummary {
  return {
    lobby: {
      id: summary.lobby.id,
      name: summary.lobby.name,
      balance: summary.lobby.balance,
    },
    balanceTotal: summary.balanceTotal,
    incomeTotal: summary.incomeTotal,
    expenseTotal: summary.expenseTotal,
    memberCount: summary.memberCount,
    recentTransactions: summary.recentTransactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date,
      member: {
        id: transaction.member.id,
        user: {
          name: transaction.member.user.name,
          email: transaction.member.user.email,
        },
      },
    })),
    incomeByCategory: summary.incomeByCategory,
    expenseByCategory: summary.expenseByCategory,
  };
}

function mapLobbyMemberContribution(
  member: GetLobbyMemberSummaryResponseDto["members"][number],
): LobbyMemberContribution {
  return {
    memberId: member.memberId,
    userId: member.userId,
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status,
    incomeTotal: member.incomeTotal,
    expenseTotal: member.expenseTotal,
    netTotal: member.netTotal,
    transactionCount: member.transactionCount,
  };
}

async function parseJson<T>(response: Response) {
  return (await response.json()) as ApiResponse<T>;
}

export async function listLobbies(): Promise<LobbyListItem[]> {
  const response = await fetch("/api/lobbies", { cache: "no-store" });
  const payload = await parseJson<ListLobbiesResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "List lobbies"));
  }

  return payload.data.lobbies.map(mapLobbyListItem);
}

export async function createLobby(input: CreateLobbyRequestDto): Promise<LobbyDetail> {
  const response = await fetch("/api/lobbies", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await parseJson<CreateLobbyResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "Create lobby"));
  }

  return mapLobbyDetail(payload.data.lobby);
}

export async function getLobbyById(lobbyId: string): Promise<LobbyDetail> {
  const response = await fetch(`/api/lobbies/${lobbyId}`, { cache: "no-store" });
  const payload = await parseJson<GetLobbyResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "Get lobby"));
  }

  return mapLobbyDetail(payload.data.lobby);
}

export async function listLobbyMembers(lobbyId: string): Promise<LobbyMember[]> {
  const response = await fetch(`/api/lobbies/${lobbyId}/members`, { cache: "no-store" });
  const payload = await parseJson<ListLobbyMembersResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "List lobby members"));
  }

  return payload.data.members.map((member) => mapLobbyMember(lobbyId, member));
}

export async function updateLobby(
  lobbyId: string,
  input: UpdateLobbyRequestDto,
): Promise<LobbyDetail> {
  const response = await fetch(`/api/lobbies/${lobbyId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await parseJson<UpdateLobbyResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "Update lobby"));
  }

  return mapLobbyDetail(payload.data.lobby);
}

export async function getLobbySummary(
  lobbyId: string,
  month: string,
): Promise<LobbySummary> {
  const response = await fetch(`/api/lobbies/${lobbyId}/summary?month=${month}`, {
    cache: "no-store",
  });
  const payload = await parseJson<GetLobbySummaryResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "Get lobby summary"));
  }

  return mapLobbySummary(payload.data.summary);
}

export async function getLobbyMemberSummary(
  lobbyId: string,
  month: string,
): Promise<LobbyMemberContribution[]> {
  const response = await fetch(`/api/lobbies/${lobbyId}/member-summary?month=${month}`, {
    cache: "no-store",
  });
  const payload = await parseJson<GetLobbyMemberSummaryResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "Get lobby member summary"));
  }

  return payload.data.members.map(mapLobbyMemberContribution);
}

export async function listLobbyTransactions(args: {
  lobbyId: string;
  month: string;
  type?: "INCOME" | "EXPENSE";
  page?: number;
  limit?: number;
}): Promise<LobbyTransaction[]> {
  const searchParams = new URLSearchParams({
    month: args.month,
    page: String(args.page ?? 1),
    limit: String(args.limit ?? 20),
  });

  if (args.type) {
    searchParams.set("type", args.type);
  }

  const response = await fetch(
    `/api/lobbies/${args.lobbyId}/transactions?${searchParams.toString()}`,
    { cache: "no-store" },
  );
  const payload = await parseJson<ListLobbyTransactionsResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "List lobby transactions"));
  }

  return payload.data.transactions.map(mapLobbyTransaction);
}

export async function createLobbyTransaction(
  lobbyId: string,
  input: CreateLobbyTransactionInput,
): Promise<LobbyTransaction> {
  const payloadBody: CreateLobbyTransactionRequestDto = {
    memberId: input.memberId,
    type: input.type,
    category: input.category.trim(),
    amount: input.amount,
    description: input.description?.trim() || null,
    date: input.date,
  };

  const response = await fetch(`/api/lobbies/${lobbyId}/transactions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payloadBody),
  });
  const payload = await parseJson<CreateLobbyTransactionResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "Create lobby transaction"));
  }

  return mapLobbyTransaction(payload.data.transaction);
}

export async function getLobbyTransactionById(
  lobbyId: string,
  transactionId: string,
): Promise<LobbyTransaction> {
  const response = await fetch(`/api/lobbies/${lobbyId}/transactions/${transactionId}`, {
    cache: "no-store",
  });
  const payload = await parseJson<GetLobbyTransactionResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "Get lobby transaction"));
  }

  return mapLobbyTransaction(payload.data.transaction);
}

export async function updateLobbyTransaction(
  lobbyId: string,
  transactionId: string,
  input: UpdateLobbyTransactionInput,
): Promise<LobbyTransaction> {
  const payloadBody: UpdateLobbyTransactionRequestDto = {
    ...(typeof input.memberId !== "undefined" ? { memberId: input.memberId } : {}),
    ...(typeof input.type !== "undefined" ? { type: input.type } : {}),
    ...(typeof input.category !== "undefined" ? { category: input.category.trim() } : {}),
    ...(typeof input.amount !== "undefined" ? { amount: input.amount } : {}),
    ...(typeof input.description !== "undefined"
      ? { description: input.description?.trim() || null }
      : {}),
    ...(typeof input.date !== "undefined" ? { date: input.date } : {}),
  };

  const response = await fetch(`/api/lobbies/${lobbyId}/transactions/${transactionId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payloadBody),
  });
  const payload = await parseJson<UpdateLobbyTransactionResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "Update lobby transaction"));
  }

  return mapLobbyTransaction(payload.data.transaction);
}

export async function deleteLobbyTransaction(
  lobbyId: string,
  transactionId: string,
): Promise<void> {
  const response = await fetch(`/api/lobbies/${lobbyId}/transactions/${transactionId}`, {
    method: "DELETE",
  });
  const payload = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok || !payload.success) {
    throw new Error(getErrorMessage(response, payload, "Delete lobby transaction"));
  }
}

export async function createLobbyMember(
  lobbyId: string,
  input: CreateLobbyMemberRequestDto,
): Promise<LobbyMember> {
  const response = await fetch(`/api/lobbies/${lobbyId}/members`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await parseJson<CreateLobbyMemberResponseDto>(response);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(getErrorMessage(response, payload, "Create lobby member"));
  }

  return mapLobbyMember(lobbyId, payload.data.member);
}

export async function deleteLobbyMember(lobbyId: string, memberId: string): Promise<void> {
  const response = await fetch(`/api/lobbies/${lobbyId}/members/${memberId}`, {
    method: "DELETE",
  });
  const payload = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok || !payload.success) {
    throw new Error(getErrorMessage(response, payload, "Delete lobby member"));
  }
}
