"use client";
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

const Transactions = () => {
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
