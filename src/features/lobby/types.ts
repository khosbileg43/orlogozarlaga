export type LobbyRole = "OWNER" | "MEMBER";
export type LobbyMemberStatus = "ACTIVE" | "LEFT";
export type LobbyTransactionType = "INCOME" | "EXPENSE";
export type LobbyActionMode = "TRANSACTION" | "TRANSFER";

export type Lobby = {
  id: string;
  name: string;
  description: string | null;
  balance: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type LobbyUser = {
  id: string;
  name: string | null;
  email: string;
};

export type LobbyMember = {
  id: string;
  lobbyId: string;
  userId: string;
  role: LobbyRole;
  status: LobbyMemberStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  user: LobbyUser;
};

export type LobbyTransaction = {
  id: string;
  lobbyId: string;
  memberId: string;
  type: LobbyTransactionType;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    role: LobbyRole;
    user: LobbyUser;
  };
};

export type LobbyListItem = Lobby & {
  role: LobbyRole;
  status: LobbyMemberStatus;
  memberCount: number;
};

export type LobbyDetail = LobbyListItem & {
  members: LobbyMember[];
};

export type LobbySummary = {
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
    type: LobbyTransactionType;
    category: string;
    amount: number;
    date: string;
    member: {
      id: string;
      user: {
        name: string | null;
        email: string;
      };
    };
  }>;
  incomeByCategory: Array<{
    category: string;
    amount: number;
  }>;
  expenseByCategory: Array<{
    category: string;
    amount: number;
  }>;
};

export type LobbyMemberContribution = {
  memberId: string;
  userId: string;
  name: string | null;
  email: string;
  role: LobbyRole;
  status: LobbyMemberStatus;
  incomeTotal: number;
  expenseTotal: number;
  netTotal: number;
  transactionCount: number;
};

export type PocketAccount = {
  id: string;
  name: string;
  balance: number;
};

export type CreateLobbyTransactionInput = {
  memberId: string;
  type: LobbyTransactionType;
  category: string;
  amount: number;
  description?: string;
  date: string;
};

export type TransferFromPocketInput = {
  accountId: string;
  memberId: string;
  amount: number;
  description?: string;
  date: string;
};

export type TransferFromPocketResult = {
  personalTransaction: {
    id: string;
    type: "TRANSFER";
    accountId: string;
    lobbyId: string | null;
    amount: number;
    category: string;
    description: string | null;
    date: string;
  };
  lobbyTransaction: LobbyTransaction;
  balances: {
    accountBalance: number;
    lobbyBalance: number;
  };
};

export type CreateLobbyInput = {
  name: string;
  description?: string;
};

export type UpdateLobbyTransactionInput = Partial<CreateLobbyTransactionInput>;

export type LobbyTab = "OVERVIEW" | "TRANSACTIONS" | "MEMBERS";
