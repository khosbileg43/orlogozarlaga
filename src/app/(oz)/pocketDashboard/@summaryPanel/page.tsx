"use client";
import React, { useEffect, useState } from "react";
import StatCard from "@/components/ui/StatCard";

type CategoryAmount = {
  category: string;
  amount: number;
};

type SummaryData = {
  incomeTotal: number;
  expenseTotal: number;
  balanceTotal: number;
  incomeByCategory: CategoryAmount[];
  expenseByCategory: CategoryAmount[];
};

type SummaryResponse = {
  success: boolean;
  data?: SummaryData;
  message?: string;
};

function toMonthParam(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatCurrency(amount: number) {
  return `${new Intl.NumberFormat("ja-JP").format(amount)} ￥`;
}

const SummaryPanel = () => {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        setError(null);
        const month = toMonthParam(monthDate);
        const response = await fetch(`/api/summary?month=${month}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = (await response.json()) as SummaryResponse;

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.message ?? "Failed to load summary");
        }

        if (isMounted) {
          setSummary(payload.data);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load summary",
          );
        }
      }
    };

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, [monthDate]);

  const incomeByCategory = summary?.incomeByCategory.slice(0, 2) ?? [];
  const expenseByCategory = summary?.expenseByCategory.slice(0, 2) ?? [];
  const monthLabel = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const moveMonth = (offset: number) => {
    setMonthDate((previous) =>
      new Date(Date.UTC(previous.getUTCFullYear(), previous.getUTCMonth() + offset, 1)),
    );
  };

  return (
    <div className="flex flex-col items-center p-2 bg-white w-full rounded-xl gap-2 h-fit">
      <div className="flex gap-2">
        <button
          className="text-xs px-3 cursor-pointer py-2 bg-[#B6D9C9] rounded-lg"
          onClick={() => moveMonth(-1)}>
          {"<"}
        </button>
        <button className="text-xs px-3 cursor-pointer py-2 bg-[#B6D9C9] rounded-lg">
          {monthLabel}
        </button>
        <button
          className="text-xs px-3 cursor-pointer py-2 bg-[#B6D9C9] rounded-lg"
          onClick={() => moveMonth(1)}>
          {">"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex w-full gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <StatCard
            title="Income"
            value={formatCurrency(summary?.incomeTotal ?? 0)}
            className="w-full flex-1 bg-[#49A078] text-[#F1F3F2]"
            valueClassName="text-2xl text-end"
          />

          {incomeByCategory.map((item) => (
            <StatCard
              key={`income-${item.category}`}
              title={item.category}
              value={formatCurrency(item.amount)}
              className="w-full flex-1 bg-[#B6D9C9] text-[#1F2421]"
              valueClassName="text-xl text-end"
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <StatCard
            title="Expenses"
            value={formatCurrency(summary?.expenseTotal ?? 0)}
            className="w-full flex-1 bg-[#216869] text-[#F1F3F2]"
            valueClassName="text-2xl text-end"
          />

          {expenseByCategory.map((item) => (
            <StatCard
              key={`expense-${item.category}`}
              title={item.category}
              value={formatCurrency(item.amount)}
              className="w-full flex-1 bg-[#A6C3C3] text-[#1F2421]"
              valueClassName="text-xl text-end"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
