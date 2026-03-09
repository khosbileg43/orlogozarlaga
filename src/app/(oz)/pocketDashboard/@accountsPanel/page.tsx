"use client";
import React, { useState } from "react";
import StatCard from "@/components/ui/StatCard";
import { dashboardTestData, formatYen } from "@/lib/test-data/dashboard";

const AccountsPanel = () => {
  const totalBalance = dashboardTestData.accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const [wrap, setWrap] = useState(false);

  return (
    <div className="panel-surface flex flex-col gap-2 rounded-3xl p-3">
      <StatCard
        title="Total balance"
        value={formatYen(totalBalance)}
        className="w-full bg-linear-to-br from-[#4ba17a] to-[#2e7964] text-[#f6fcf9]"
        valueClassName="text-2xl text-end"
      />

      {dashboardTestData.accounts.map((account, index) => {
        if (!wrap && index >= 2) return null;
        return (
          <StatCard
            key={account.id}
            title={account.name}
            value={formatYen(account.balance)}
            className="w-full bg-[#f8fcf9] text-[#1b332b]"
            valueClassName="text-xl text-end"
          />
        );
      })}
      <button
        onClick={() => setWrap(!wrap)}
        className="mt-1 cursor-pointer rounded-lg border border-[#cadcd1] bg-white/70 px-2 py-1 text-xs font-medium text-[#365447] hover:bg-[#edf5f0]">
        {wrap ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

export default AccountsPanel;
