"use client";
import React, { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/ui/StatCard";

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

  return (
    <div className="flex flex-col p-2 bg-white rounded-xl gap-2 h-fit">
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
    </div>
  );
};

export default AccountsPanel;
