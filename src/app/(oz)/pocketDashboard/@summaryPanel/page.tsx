"use client";
import React, { useEffect, useState } from "react";
import React, { useMemo, useState } from "react";
import StatCard from "@/components/ui/StatCard";
import {
  dashboardTestData,
  formatMonthLabel,
  formatYen,
  getSummaryByMonth,
  shiftMonth,
} from "@/lib/test-data/dashboard";

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
  const [month, setMonth] = useState(dashboardTestData.defaultMonth);
  const [wrap, setWrap] = useState(false);
  const summary = useMemo(() => getSummaryByMonth(month), [month]);

  return (
    <div className="panel-surface flex flex-col items-center gap-3 rounded-3xl p-3">
      <div className="flex w-full items-center justify-center gap-2">
        <button
          className="cursor-pointer rounded-lg border border-[#d5e3db] bg-[#eef6f1] px-3 py-2 text-xs font-semibold text-[#2d4b3f] hover:bg-[#dcece3]"
          onClick={() => setMonth((current) => shiftMonth(current, -1))}>
          {"<"}
        </button>
        <button className="rounded-lg border border-[#d2e3d8] bg-white/70 px-3 py-2 text-xs font-semibold text-[#1f3d32]">
          {formatMonthLabel(month)}
        </button>
        <button
          className="cursor-pointer rounded-lg border border-[#d5e3db] bg-[#eef6f1] px-3 py-2 text-xs font-semibold text-[#2d4b3f] hover:bg-[#dcece3]"
          onClick={() => setMonth((current) => shiftMonth(current, 1))}>
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
      <div className="flex w-full flex-col gap-2 lg:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <StatCard
            title="Income"
            value={formatYen(summary.incomeTotal)}
            className="w-full bg-linear-to-br from-[#44a079] to-[#2e7d65] text-[#f6fcf9]"
            valueClassName="text-2xl text-end"
          />

          {wrap
            ? summary.incomeByCategory.map((item) => (
                <StatCard
                  key={`income-${item.category}`}
                  title={item.category}
                  value={formatYen(item.amount)}
                  className="w-full bg-[#eef6f1] text-[#1f3a30]"
                  valueClassName="text-xl text-end"
                />
              ))
            : summary.incomeByCategory
                .slice(0, 2)
                .map((item) => (
                  <StatCard
                    key={`income-${item.category}`}
                    title={item.category}
                    value={formatYen(item.amount)}
                    className="w-full bg-[#eef6f1] text-[#1f3a30]"
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
            value={formatYen(summary.expenseTotal)}
            className="w-full bg-linear-to-br from-[#2e6f72] to-[#22565e] text-[#f6fcf9]"
            valueClassName="text-2xl text-end"
          />

          {wrap
            ? summary.expenseByCategory.map((item) => (
                <StatCard
                  key={`expense-${item.category}`}
                  title={item.category}
                  value={formatYen(item.amount)}
                  className="w-full bg-[#e8f1f2] text-[#1f3a30]"
                  valueClassName="text-xl text-end"
                />
              ))
            : summary.expenseByCategory
                .slice(0, 2)
                .map((item) => (
                  <StatCard
                    key={`expense-${item.category}`}
                    title={item.category}
                    value={formatYen(item.amount)}
                    className="w-full bg-[#e8f1f2] text-[#1f3a30]"
                    valueClassName="text-xl text-end"
                  />
                ))}
        </div>
      </div>
      <button
        className="cursor-pointer rounded-lg border border-[#cadcd1] bg-white/70 px-2 py-1 text-xs font-medium text-[#365447] hover:bg-[#edf5f0]"
        onClick={() => setWrap(!wrap)}>
        {wrap ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

export default SummaryPanel;
