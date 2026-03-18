"use client";
import { ChartNoAxesCombined, TrendingDown, TrendingUp } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  ChartNoAxesCombined,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import React, { useState } from "react";
import TransactionRow from "@/components/ui/TransactionRow";
import {
  dashboardTestData,
  formatIsoDate,
  formatSignedYen,
} from "@/lib/test-data/dashboard";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description: string | null;
  date: string;
};

type TransactionsResponse = {
  success: boolean;
  data?: {
    transactions: Transaction[];
  };
  message?: string;
};

function toCurrentMonthParam() {
  const date = new Date();
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatAmount(transaction: Transaction) {
  const prefix = transaction.type === "INCOME" ? "+" : "-";
  return `${prefix}${new Intl.NumberFormat("ja-JP").format(transaction.amount)} ￥`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
}

const Transactions = () => {
  const [transactionsType, setTransactionsType] = useState("All");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      try {
        setError(null);
        const response = await fetch(
          `/api/transactions?month=${toCurrentMonthParam()}`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );
        const payload = (await response.json()) as TransactionsResponse;

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.message ?? "Failed to load transactions");
        }

        if (isMounted) {
          setTransactions(payload.data.transactions);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load transactions",
          );
        }
      }
    };

    void loadTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        if (transactionsType === "Income") {
          return transaction.type === "INCOME";
        }
        if (transactionsType === "Expense") {
          return transaction.type === "EXPENSE";
        }
        return true;
      }),
    [transactions, transactionsType],
  );

  const [transactionsType, setTransactionsType] = useState<
    "ALL" | "INCOME" | "EXPENSE"
  >("ALL");

  const filteredTransactions = dashboardTestData.transactions.filter(
    (transaction) =>
      transactionsType === "ALL" || transaction.type === transactionsType,
  );

  const iconByType: Record<"INCOME" | "EXPENSE" | "TRANSFER", LucideIcon> = {
    INCOME: TrendingUp,
    EXPENSE: TrendingDown,
    TRANSFER: ChartNoAxesCombined, // Use any icon for transfer
  };

  const buttonClass = (type: "ALL" | "INCOME" | "EXPENSE") =>
    `cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold ${
      transactionsType === type
        ? "bg-[#215c54] text-white shadow-[0_8px_18px_rgba(26,83,73,0.25)]"
        : "bg-[#edf5f0] text-[#355246] hover:bg-[#dcebe2]"
    }`;

  return (
    <div className="panel-surface flex w-full flex-col gap-3 rounded-3xl px-3 py-4">
      <div className="flex items-center gap-2 px-1">
        <ChartNoAxesCombined className="text-[#2a5f58]" />
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#486156]">
          Last transactions
        </p>
      </div>

      <div className="flex flex-wrap gap-2 px-1">
        <button className={buttonClass("ALL")} onClick={() => setTransactionsType("ALL")}>
          All
        </button>
        <button className={buttonClass("INCOME")} onClick={() => setTransactionsType("INCOME")}>
          Income
        </button>
        <button
          className={buttonClass("EXPENSE")}
          onClick={() => setTransactionsType("EXPENSE")}>
          Expense
        </button>
      </div>

      {error ? <p className="text-sm text-red-600 ml-2">{error}</p> : null}

      <div className="bg-[#A5A7A6] flex flex-col gap-px">
        {filteredTransactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            Icon={transaction.type === "INCOME" ? TrendingUp : TrendingDown}
            title={transaction.description ?? "No description"}
            meta={`${transaction.category} | ${formatDate(transaction.date)}`}
            amount={formatAmount(transaction)}
            amountClassName={`text-2xl text-end ${transaction.type === "INCOME" ? "text-green-700" : "text-red-700"}`}
      <div className="flex flex-col gap-2">
        {filteredTransactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            Icon={iconByType[transaction.type] ?? ChartNoAxesCombined}
            title={transaction.description}
            meta={`${transaction.category} | ${formatIsoDate(transaction.date)}`}
            amount={formatSignedYen(transaction.type, transaction.amount)}
          />
        ))}

        {!filteredTransactions.length && (
          <div className="rounded-xl border border-dashed border-[#cbdcd2] bg-white/70 px-3 py-5 text-center text-sm text-[#5a7166]">
            No transactions in this filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
