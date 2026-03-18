"use client";
import React, { useEffect, useMemo, useState } from "react";
import React, { useState } from "react";
import StatCard from "@/components/ui/StatCard";
import { dashboardTestData, formatYen } from "@/lib/test-data/dashboard";

type Account = {
  id: string;
  name: string;
  balance: number;
};

type AccountsResponse = {
  success: boolean;
  data?: {
    accounts: Account[];
  };
  message?: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ja-JP").format(amount);
}

const AccountsPanel = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAccounts = async () => {
      try {
        setError(null);
        const response = await fetch("/api/accounts", {
          credentials: "include",
          cache: "no-store",
        });
        const payload = (await response.json()) as AccountsResponse;

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.message ?? "Failed to load accounts");
        }

        if (isMounted) {
          setAccounts(payload.data.accounts);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load accounts",
          );
        }
      }
    };

    void loadAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );
  const totalBalance = dashboardTestData.accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const [wrap, setWrap] = useState(false);

  return (
    <div className="panel-surface flex flex-col gap-2 rounded-3xl p-3">
      <StatCard
        title="Total balance"
        value={`${formatCurrency(totalBalance)} ￥`}
        className="w-55 bg-[#9CC5A1] text-[#F1F3F2]"
        valueClassName="text-2xl text-end"
      />

      {error ? (
        <p className="text-sm text-red-600 px-2">{error}</p>
      ) : (
        accounts.map((account) => (
          <StatCard
            key={account.id}
            title={account.name}
            value={`${formatCurrency(account.balance)} ￥`}
            className="w-55 bg-[#EAEDEB] text-[#1F2421]"
            valueClassName="text-xl text-end"
          />
        ))
      )}
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
