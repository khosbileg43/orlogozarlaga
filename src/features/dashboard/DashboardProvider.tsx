"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiResponse } from "@/types";
import { getCurrentMonthKey } from "./format";
import {
  DashboardAccount,
  DashboardSummary,
  DashboardTransaction,
  TransactionType,
} from "./types";

type TransactionCreateInput = {
  accountId: string;
  toAccountId?: string;
  type: TransactionType;
  category: string;
  amount: number;
  description?: string;
  dateIso: string;
};

type DashboardContextValue = {
  month: string;
  setMonth: React.Dispatch<React.SetStateAction<string>>;
  accounts: DashboardAccount[];
  summary: DashboardSummary;
  transactions: DashboardTransaction[];
  isLoadingAccounts: boolean;
  isLoadingMonthData: boolean;
  isSubmitting: boolean;
  error: string | null;
  createTransaction: (input: TransactionCreateInput) => Promise<boolean>;
  refreshAll: () => Promise<void>;
};

const emptySummary: DashboardSummary = {
  incomeTotal: 0,
  expenseTotal: 0,
  incomeByCategory: [],
  expenseByCategory: [],
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

async function parseApiResponseOrThrow<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? payload.error ?? "Request failed");
  }
  if (payload.data === undefined) {
    throw new Error("Response data is missing");
  }
  return payload.data;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [month, setMonth] = useState(getCurrentMonthKey());
  const [accounts, setAccounts] = useState<DashboardAccount[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingMonthData, setIsLoadingMonthData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      type AccountsResponse = {
        accounts: DashboardAccount[];
      };
      const response = await fetch("/api/accounts", { cache: "no-store" });
      const data = await parseApiResponseOrThrow<AccountsResponse>(response);
      setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
      setError(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load accounts";
      setError(message);
      setAccounts([]);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  const loadMonthData = useCallback(async (monthValue: string) => {
    setIsLoadingMonthData(true);
    try {
      type SummaryResponse = {
        incomeTotal: number;
        expenseTotal: number;
        incomeByCategory: DashboardSummary["incomeByCategory"];
        expenseByCategory: DashboardSummary["expenseByCategory"];
      };
      type TransactionsResponse = {
        transactions: DashboardTransaction[];
      };

      const [summaryRes, txRes] = await Promise.all([
        fetch(`/api/summary?month=${encodeURIComponent(monthValue)}`, {
          cache: "no-store",
        }),
        fetch(`/api/transactions?month=${encodeURIComponent(monthValue)}`, {
          cache: "no-store",
        }),
      ]);

      const [summaryData, txData] = await Promise.all([
        parseApiResponseOrThrow<SummaryResponse>(summaryRes),
        parseApiResponseOrThrow<TransactionsResponse>(txRes),
      ]);

      setSummary({
        incomeTotal: summaryData.incomeTotal,
        expenseTotal: summaryData.expenseTotal,
        incomeByCategory: Array.isArray(summaryData.incomeByCategory)
          ? summaryData.incomeByCategory
          : [],
        expenseByCategory: Array.isArray(summaryData.expenseByCategory)
          ? summaryData.expenseByCategory
          : [],
      });
      setTransactions(Array.isArray(txData.transactions) ? txData.transactions : []);
      setError(null);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to load monthly data";
      setError(message);
      setSummary(emptySummary);
      setTransactions([]);
    } finally {
      setIsLoadingMonthData(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadAccounts(), loadMonthData(month)]);
  }, [loadAccounts, loadMonthData, month]);

  const createTransaction = useCallback(
    async (input: TransactionCreateInput) => {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId: input.accountId,
            toAccountId: input.toAccountId,
            type: input.type,
            category: input.category,
            amount: input.amount,
            description: input.description,
            date: input.dateIso,
          }),
        });
        await parseApiResponseOrThrow<{ transaction: DashboardTransaction }>(response);
        await Promise.all([loadAccounts(), loadMonthData(month)]);
        setError(null);
        return true;
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Failed to create transaction";
        setError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadAccounts, loadMonthData, month],
  );

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    void loadMonthData(month);
  }, [loadMonthData, month]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      month,
      setMonth,
      accounts,
      summary,
      transactions,
      isLoadingAccounts,
      isLoadingMonthData,
      isSubmitting,
      error,
      createTransaction,
      refreshAll,
    }),
    [
      month,
      accounts,
      summary,
      transactions,
      isLoadingAccounts,
      isLoadingMonthData,
      isSubmitting,
      error,
      createTransaction,
      refreshAll,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }
  return ctx;
}
