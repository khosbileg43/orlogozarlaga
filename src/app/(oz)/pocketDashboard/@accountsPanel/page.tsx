"use client";

import React, { useState } from "react";
import StatCard from "@/components/ui/StatCard";
import { useDashboard } from "@/features/dashboard/DashboardProvider";
import { formatYen } from "@/features/dashboard/format";

const AccountsPanel = () => {
  const { accounts, isLoadingAccounts, isSubmitting, error, createAccount } =
    useDashboard();
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const totalBalance = safeAccounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const [wrap, setWrap] = useState(false);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreateAccount() {
    setFormError(null);

    const normalizedName = name.trim();
    if (!normalizedName) {
      setFormError("Account name is required.");
      return;
    }

    const success = await createAccount({
      name: normalizedName,
    });

    if (!success) {
      return;
    }

    setName("");
  }

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

      <div className="mt-1 rounded-2xl border border-[#d7e5dd] bg-[#f7fbf8] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#547064]">
          Create account
        </p>

        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            placeholder="Account name"
            className="w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2 text-sm text-[#1d3b30] outline-none placeholder:text-[#7b9288]"
          />

          {(formError || error) && (
            <p className="text-xs text-[#9a3d2e]">{formError ?? error}</p>
          )}

          <button
            type="button"
            onClick={() => void handleCreateAccount()}
            disabled={isSubmitting || isLoadingAccounts}
            className="w-full rounded-xl bg-linear-to-r from-[#2f8f70] to-[#2a7262] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(35,108,86,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating..." : "Add account"}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setWrap(!wrap)}
        disabled={!safeAccounts.length}
        className="mt-1 cursor-pointer rounded-lg border border-[#cadcd1] bg-white/70 px-2 py-1 text-xs font-medium text-[#365447] hover:bg-[#edf5f0]">
        {wrap ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

export default AccountsPanel;
