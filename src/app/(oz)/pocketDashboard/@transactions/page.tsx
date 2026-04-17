"use client";

import {
  ArrowRightLeft,
  ChartNoAxesCombined,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import React, { useState } from "react";
import TransactionRow from "@/components/ui/TransactionRow";
import {
  formatIsoDate,
  formatSignedYen,
} from "@/features/dashboard/format";
import { useDashboard } from "@/features/dashboard/DashboardProvider";
import { TransactionFilter, TransactionType } from "@/features/dashboard/types";
import { getCopy } from "@/features/settings/copy";
import { useUserPreferences } from "@/features/settings/useUserPreferences";

const Transactions = () => {
  const { transactions, isLoadingMonthData, isSubmitting, startEditingTransaction, deleteTransaction } =
    useDashboard();
  const { preferences } = useUserPreferences();
  const copy = getCopy(preferences.language);
  const locale = preferences.language === "MN" ? "mn-MN" : "en-US";
  const [transactionsType, setTransactionsType] = useState<TransactionFilter>("ALL");

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transactionsType === "ALL" || transaction.type === transactionsType,
  );

  const iconByType: Record<TransactionType, LucideIcon> = {
    INCOME: TrendingUp,
    EXPENSE: TrendingDown,
    TRANSFER: ArrowRightLeft,
  };

  const buttonClass = (type: "ALL" | "INCOME" | "EXPENSE" | "TRANSFER") =>
    `cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold ${
      transactionsType === type ? "theme-chip theme-chip-active" : "theme-chip"
    }`;

  return (
    <div className="panel-surface flex w-full flex-col gap-3 rounded-3xl px-3 py-4">
      <div className="flex items-center gap-2 px-1">
        <ChartNoAxesCombined className="theme-icon" />
        <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
          {copy.lastTransactions}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 px-1">
        <button className={buttonClass("ALL")} onClick={() => setTransactionsType("ALL")}>
          {copy.all}
        </button>
        <button
          className={buttonClass("INCOME")}
          onClick={() => setTransactionsType("INCOME")}>
          {copy.income}
        </button>
        <button
          className={buttonClass("EXPENSE")}
          onClick={() => setTransactionsType("EXPENSE")}>
          {copy.expense}
        </button>
        <button
          className={buttonClass("TRANSFER")}
          onClick={() => setTransactionsType("TRANSFER")}>
          {copy.transfer}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {filteredTransactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            Icon={iconByType[transaction.type] ?? ChartNoAxesCombined}
            title={transaction.description ?? transaction.category}
            meta={`${transaction.category} | ${formatIsoDate(transaction.date, locale)}`}
            actions={
              !transaction.lobbyId ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditingTransaction(transaction.id)}
                    className="theme-button-secondary rounded-lg px-3 py-2 text-xs font-medium">
                    {copy.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteTransaction(transaction.id)}
                    disabled={isSubmitting}
                    className="theme-status-error rounded-lg px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-70">
                    {copy.delete}
                  </button>
                </div>
              ) : null
            }
            amount={formatSignedYen(
              transaction.type,
              transaction.amount,
              preferences.currency,
              preferences.hideBalances,
            )}
          />
        ))}

        {isLoadingMonthData && (
          <div className="theme-empty-state rounded-xl px-3 py-5 text-center text-sm">
            {copy.loadingTransactions}
          </div>
        )}

        {!isLoadingMonthData && !filteredTransactions.length && (
          <div className="theme-empty-state rounded-xl px-3 py-5 text-center text-sm">
            {copy.noTransactions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
