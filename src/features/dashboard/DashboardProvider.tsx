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
import { useUserPreferences } from "@/features/settings/useUserPreferences";
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

type TransactionUpdateInput = {
  transactionId: string;
  accountId?: string;
  toAccountId?: string | null;
  type?: TransactionType;
  category?: string;
  amount?: number;
  description?: string;
  dateIso?: string;
};

type AccountCreateInput = {
  name: string;
};

type DashboardContextValue = {
  month: string;
  setMonth: React.Dispatch<React.SetStateAction<string>>;
  accounts: DashboardAccount[];
  summary: DashboardSummary;
  transactions: DashboardTransaction[];
  editingTransaction: DashboardTransaction | null;
  isLoadingAccounts: boolean;
  isLoadingMonthData: boolean;
  isSubmitting: boolean;
  error: string | null;
  createAccount: (input: AccountCreateInput) => Promise<boolean>;
  createTransaction: (input: TransactionCreateInput) => Promise<boolean>;
  startEditingTransaction: (transactionId: string) => void;
  cancelEditingTransaction: () => void;
  updateTransaction: (input: TransactionUpdateInput) => Promise<boolean>;
  deleteTransaction: (transactionId: string) => Promise<boolean>;
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
  const { preferences } = useUserPreferences();
  const monthStart = Number(preferences.monthStart);
  const [month, setMonth] = useState(getCurrentMonthKey());
  const [accounts, setAccounts] = useState<DashboardAccount[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
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
        fetch(
          `/api/summary?month=${encodeURIComponent(monthValue)}&monthStart=${encodeURIComponent(
            String(monthStart),
          )}`,
          {
          cache: "no-store",
          },
        ),
        fetch(
          `/api/transactions?month=${encodeURIComponent(monthValue)}&monthStart=${encodeURIComponent(
            String(monthStart),
          )}&page=1&limit=200`,
          {
          cache: "no-store",
          },
        ),
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
  }, [monthStart]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadAccounts(), loadMonthData(month)]);
  }, [loadAccounts, loadMonthData, month]);

  const createAccount = useCallback(
    async (input: AccountCreateInput) => {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: input.name,
          }),
        });
        await parseApiResponseOrThrow<{ account: DashboardAccount }>(response);
        await loadAccounts();
        setError(null);
        return true;
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Failed to create account";
        setError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadAccounts],
  );

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

  const updateTransaction = useCallback(
    async (input: TransactionUpdateInput) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/transactions/${input.transactionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(typeof input.accountId !== "undefined" ? { accountId: input.accountId } : {}),
            ...(typeof input.toAccountId !== "undefined"
              ? { toAccountId: input.toAccountId }
              : {}),
            ...(typeof input.type !== "undefined" ? { type: input.type } : {}),
            ...(typeof input.category !== "undefined" ? { category: input.category } : {}),
            ...(typeof input.amount !== "undefined" ? { amount: input.amount } : {}),
            ...(typeof input.description !== "undefined"
              ? { description: input.description || null }
              : {}),
            ...(typeof input.dateIso !== "undefined" ? { date: input.dateIso } : {}),
          }),
        });
        await parseApiResponseOrThrow<{ transaction: DashboardTransaction }>(response);
        await Promise.all([loadAccounts(), loadMonthData(month)]);
        setEditingTransactionId(null);
        setError(null);
        return true;
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Failed to update transaction";
        setError(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadAccounts, loadMonthData, month],
  );

  const deleteTransaction = useCallback(
    async (transactionId: string) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/transactions/${transactionId}`, {
          method: "DELETE",
        });
        await parseApiResponseOrThrow<{ transaction: DashboardTransaction }>(response);
        await Promise.all([loadAccounts(), loadMonthData(month)]);
        setEditingTransactionId((current) =>
          current === transactionId ? null : current,
        );
        setError(null);
        return true;
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Failed to delete transaction";
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
    const frameId = window.requestAnimationFrame(() => {
      setMonth(getCurrentMonthKey(monthStart));
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [monthStart]);

  useEffect(() => {
    void loadMonthData(month);
  }, [loadMonthData, month, monthStart]);

  const editingTransaction =
    transactions.find((transaction) => transaction.id === editingTransactionId) ?? null;

  const value = useMemo<DashboardContextValue>(
    () => ({
      month,
      setMonth,
      accounts,
      summary,
      transactions,
      editingTransaction,
      isLoadingAccounts,
      isLoadingMonthData,
      isSubmitting,
      error,
      createAccount,
      createTransaction,
      startEditingTransaction: (transactionId: string) => setEditingTransactionId(transactionId),
      cancelEditingTransaction: () => setEditingTransactionId(null),
      updateTransaction,
      deleteTransaction,
      refreshAll,
    }),
    [
      month,
      accounts,
      summary,
      transactions,
      editingTransaction,
      isLoadingAccounts,
      isLoadingMonthData,
      isSubmitting,
      error,
      createAccount,
      createTransaction,
      updateTransaction,
      deleteTransaction,
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
