"use client";
import React, { useMemo, useState } from "react";
import StatCard from "@/components/ui/StatCard";
import {
  dashboardTestData,
  formatMonthLabel,
  formatYen,
  getSummaryByMonth,
  shiftMonth,
} from "@/lib/test-data/dashboard";

const SummaryPanel = () => {
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
