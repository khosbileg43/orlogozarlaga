"use client";

import {
  ArrowRightLeft,
  ChartNoAxesCombined,
  EllipsisVertical,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import TransactionRow from "@/components/ui/TransactionRow";
import { formatIsoDate, formatSignedYen } from "@/features/dashboard/format";
import { useDashboard } from "@/features/dashboard/DashboardProvider";
import { TransactionFilter, TransactionType } from "@/features/dashboard/types";
import { getCopy } from "@/features/settings/copy";
import { useUserPreferences } from "@/features/settings/useUserPreferences";

const Transactions = () => {
  const {
    transactions,
    isLoadingMonthData,
    isSubmitting,
    startEditingTransaction,
    deleteTransaction,
  } = useDashboard();
  const { preferences } = useUserPreferences();
  const copy = getCopy(preferences.language);
  const locale = preferences.language === "MN" ? "mn-MN" : "en-US";
  const [transactionsType, setTransactionsType] =
    useState<TransactionFilter>("ALL");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const menuButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const updateMenuPosition = (transactionId: string) => {
    const anchor = menuButtonRefs.current[transactionId];
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom - 35,
      left: rect.right + 5,
    });
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("[data-transaction-menu]")) return;
      setOpenMenuId(null);
      setMenuPosition(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!openMenuId) {
      return;
    }

    const updatePosition = () => {
      updateMenuPosition(openMenuId);
    };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [openMenuId]);

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
        <button
          className={buttonClass("ALL")}
          onClick={() => setTransactionsType("ALL")}>
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
                <div data-transaction-menu>
                  <button
                    type="button"
                    ref={(node) => {
                      menuButtonRefs.current[transaction.id] = node;
                    }}
                    aria-label="Open transaction actions"
                    aria-expanded={openMenuId === transaction.id}
                    onClick={() => {
                      setOpenMenuId((current) => {
                        const nextId =
                          current === transaction.id ? null : transaction.id;

                        if (nextId) {
                          updateMenuPosition(nextId);
                        } else {
                          setMenuPosition(null);
                        }

                        return nextId;
                      });
                    }}
                    className="theme-button-secondary grid h-9 w-9 place-items-center rounded-lg">
                    <EllipsisVertical size={16} />
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

      {openMenuId && menuPosition
        ? createPortal(
            <div
              data-transaction-menu
              className="theme-card-default fixed z-100 min-w-35 rounded-xl p-1 shadow-[0_18px_40px_rgba(16,38,33,0.18)]"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
              }}>
              <button
                type="button"
                onClick={() => {
                  startEditingTransaction(openMenuId);
                  setOpenMenuId(null);
                  setMenuPosition(null);
                }}
                className="theme-button-secondary flex w-full items-center justify-start rounded-lg px-3 py-2 text-xs font-medium">
                {copy.edit}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenMenuId(null);
                  setMenuPosition(null);
                  void deleteTransaction(openMenuId);
                }}
                disabled={isSubmitting}
                className="theme-status-error mt-1 flex w-full items-center justify-start rounded-lg px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-70">
                {copy.delete}
              </button>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default Transactions;
