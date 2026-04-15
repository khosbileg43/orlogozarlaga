export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

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
