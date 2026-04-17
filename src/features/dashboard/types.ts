export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type TransactionFilter = "ALL" | TransactionType;

export type DashboardAccount = {
  id: string;
  name: string;
  balance: number;
};

export type DashboardSummaryItem = {
  category: string;
  amount: number;
};

export type DashboardSummary = {
  incomeTotal: number;
  expenseTotal: number;
  incomeByCategory: DashboardSummaryItem[];
  expenseByCategory: DashboardSummaryItem[];
};

export type DashboardTransaction = {
  id: string;
  type: TransactionType;
  category: string;
  description: string | null;
  amount: number;
  date: string;
  accountId: string;
  toAccountId: string | null;
  lobbyId: string | null;
};
