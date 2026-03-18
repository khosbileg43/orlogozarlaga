"use client";

import React, { useState } from "react";
import StatCard from "@/components/ui/StatCard";
import { useDashboard } from "@/features/dashboard/DashboardProvider";
import { formatYen } from "@/features/dashboard/format";

const AccountsPanel = () => {
  const { accounts, isLoadingAccounts } = useDashboard();
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const totalBalance = safeAccounts.reduce(
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

      {safeAccounts.map((account, index) => {
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

      {isLoadingAccounts && (
        <p className="px-1 text-xs text-[#4f665c]">Loading accounts...</p>
      )}

      {!isLoadingAccounts && !safeAccounts.length && (
        <p className="rounded-lg border border-dashed border-[#cadcd1] px-2 py-3 text-center text-xs text-[#4f665c]">
          No accounts found.
        </p>
      )}

      <button
        onClick={() => setWrap(!wrap)}
        disabled={!safeAccounts.length}
        className="mt-1 cursor-pointer rounded-lg border border-[#cadcd1] bg-white/70 px-2 py-1 text-xs font-medium text-[#365447] hover:bg-[#edf5f0]">
        {wrap ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

export default AccountsPanel;
