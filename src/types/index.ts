export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type IsoDateString = string;

export type AuthenticatedUser = {
  id: string;
  auth0Id: string;
  email: string;
  name: string | null;
};

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type TransactionDto = {
  id: string;
  accountId: string;
  toAccountId: string | null;
  type: TransactionType;
  category: string;
  amount: number;
  description: string | null;
  date: Date;
};

export type AccountDto = {
  id: string;
  name: string;
  balance: number;
};

export type CategoryAmountDto = {
  category: string;
  amount: number;
};

export type LobbyRoleDto = "OWNER" | "MEMBER";

export type LobbyMemberStatusDto = "ACTIVE" | "LEFT";

export type LobbyMemberDto = {
  id: string;
  userId: string;
  role: LobbyRoleDto;
  status: LobbyMemberStatusDto;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

export type LobbyListItemDto = {
  id: string;
  name: string;
  description: string | null;
  balance: number;
  createdById: string;
  role: LobbyRoleDto;
  status: LobbyMemberStatusDto;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type LobbyDetailDto = LobbyListItemDto & {
  members: LobbyMemberDto[];
};

export type LobbyMemberApiDto = {
  id: string;
  userId: string;
  role: LobbyRoleDto;
  status: LobbyMemberStatusDto;
  joinedAt: IsoDateString;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

export type LobbyListItemApiDto = {
  id: string;
  name: string;
  description: string | null;
  balance: number;
  createdById: string;
  role: LobbyRoleDto;
  status: LobbyMemberStatusDto;
  memberCount: number;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type LobbyDetailApiDto = LobbyListItemApiDto & {
  members: LobbyMemberApiDto[];
};

export type CreateLobbyRequestDto = {
  name: string;
  description?: string | null;
};

export type UpdateLobbyRequestDto = {
  name?: string;
  description?: string | null;
};

export type ListLobbiesResponseDto = {
  lobbies: LobbyListItemApiDto[];
};

export type GetLobbyResponseDto = {
  lobby: LobbyDetailApiDto;
};

export type CreateLobbyResponseDto = {
  lobby: LobbyDetailApiDto;
};

export type UpdateLobbyResponseDto = {
  lobby: LobbyDetailApiDto;
};
