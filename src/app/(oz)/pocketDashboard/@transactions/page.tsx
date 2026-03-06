"use client";
import { ChartNoAxesCombined, TrendingDown, TrendingUp } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import TransactionRow from "@/components/ui/TransactionRow";

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

  return (
    <div className="px-2 py-4 flex flex-col gap-2 w-full bg-white rounded-xl">
      <div className="flex ml-2 gap-2 items-center">
        <ChartNoAxesCombined />
        <p className="text-xs">Last transactions</p>
      </div>

      <div className="flex ml-2 gap-2">
        <button
          className="text-xs cursor-pointer px-3 py-2 bg-[#B6D9C9] text-[#F1F3F2] rounded-lg"
          onClick={() => setTransactionsType("All")}>
          All
        </button>
        <button
          className="text-xs cursor-pointer px-3 py-2 bg-[#49A078] text-[#F1F3F2] rounded-lg"
          onClick={() => setTransactionsType("Income")}>
          Income
        </button>
        <button
          className="text-xs cursor-pointer px-3 py-2 bg-[#216869] text-[#F1F3F2] rounded-lg"
          onClick={() => setTransactionsType("Expense")}>
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
          />
        ))}
      </div>
    </div>
  );
};

export default Transactions;
