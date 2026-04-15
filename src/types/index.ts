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

export type LobbyTransactionTypeDto = "INCOME" | "EXPENSE";

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

export type LobbyTransactionDto = {
  id: string;
  lobbyId: string;
  memberId: string;
  type: LobbyTransactionTypeDto;
  category: string;
  amount: number;
  description: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  member: LobbyMemberDto;
};

export type LobbyMemberSummaryDto = {
  memberId: string;
  userId: string;
  role: LobbyRoleDto;
  status: LobbyMemberStatusDto;
  name: string | null;
  email: string;
  incomeTotal: number;
  expenseTotal: number;
  netTotal: number;
  transactionCount: number;
};

export type LobbySummaryDto = {
  lobby: {
    id: string;
    name: string;
    balance: number;
  };
  balanceTotal: number;
  incomeTotal: number;
  expenseTotal: number;
  memberCount: number;
  recentTransactions: Array<{
    id: string;
    type: LobbyTransactionTypeDto;
    category: string;
    amount: number;
    date: Date;
    member: {
      id: string;
      user: {
        name: string | null;
        email: string;
      };
    };
  }>;
  incomeByCategory: CategoryAmountDto[];
  expenseByCategory: CategoryAmountDto[];
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

export type LobbyTransactionApiDto = {
  id: string;
  lobbyId: string;
  memberId: string;
  type: LobbyTransactionTypeDto;
  category: string;
  amount: number;
  description: string | null;
  date: IsoDateString;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  member: LobbyMemberApiDto;
};

export type LobbyMemberSummaryApiDto = {
  memberId: string;
  userId: string;
  role: LobbyRoleDto;
  status: LobbyMemberStatusDto;
  name: string | null;
  email: string;
  incomeTotal: number;
  expenseTotal: number;
  netTotal: number;
  transactionCount: number;
};

export type LobbySummaryApiDto = {
  lobby: {
    id: string;
    name: string;
    balance: number;
  };
  balanceTotal: number;
  incomeTotal: number;
  expenseTotal: number;
  memberCount: number;
  recentTransactions: Array<{
    id: string;
    type: LobbyTransactionTypeDto;
    category: string;
    amount: number;
    date: IsoDateString;
    member: {
      id: string;
      user: {
        name: string | null;
        email: string;
      };
    };
  }>;
  incomeByCategory: CategoryAmountDto[];
  expenseByCategory: CategoryAmountDto[];
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

export type DeleteLobbyResponseDto = {
  lobby: LobbyDetailApiDto;
};

export type CreateLobbyMemberRequestDto = {
  email: string;
  role?: LobbyRoleDto;
};

export type UpdateLobbyMemberRequestDto = {
  role?: LobbyRoleDto;
  status?: LobbyMemberStatusDto;
};

export type ListLobbyMembersResponseDto = {
  members: LobbyMemberApiDto[];
};

export type GetLobbyMemberResponseDto = {
  member: LobbyMemberApiDto;
};

export type CreateLobbyMemberResponseDto = {
  member: LobbyMemberApiDto;
};

export type UpdateLobbyMemberResponseDto = {
  member: LobbyMemberApiDto;
};

export type DeleteLobbyMemberResponseDto = {
  member: LobbyMemberApiDto;
};

export type CreateLobbyTransactionRequestDto = {
  memberId: string;
  type: LobbyTransactionTypeDto;
  category: string;
  amount: number;
  description?: string | null;
  date: IsoDateString;
};

export type UpdateLobbyTransactionRequestDto = {
  memberId?: string;
  type?: LobbyTransactionTypeDto;
  category?: string;
  amount?: number;
  description?: string | null;
  date?: IsoDateString;
};

export type ListLobbyTransactionsResponseDto = {
  transactions: LobbyTransactionApiDto[];
};

export type GetLobbyTransactionResponseDto = {
  transaction: LobbyTransactionApiDto;
};

export type CreateLobbyTransactionResponseDto = {
  transaction: LobbyTransactionApiDto;
};

export type UpdateLobbyTransactionResponseDto = {
  transaction: LobbyTransactionApiDto;
};

export type DeleteLobbyTransactionResponseDto = {
  transaction: LobbyTransactionApiDto;
};

export type GetLobbySummaryResponseDto = {
  summary: LobbySummaryApiDto;
};

export type GetLobbyMemberSummaryResponseDto = {
  members: LobbyMemberSummaryApiDto[];
};
