"use client";
import React, { useMemo, useState } from "react";
import PillTabs from "@/components/ui/PillTabs";
import InputField from "@/components/ui/InputField";
import {
  dashboardTestData,
  formatYen,
  type TransactionType,
} from "@/lib/test-data/dashboard";

const transferCategories = ["Between accounts", "Savings move"];

const AddTransaction = () => {
  const [transactionType, setTransactionType] =
    useState<TransactionType>("INCOME");
  const [accountId, setAccountId] = useState(
    dashboardTestData.accounts[0]?.id ?? "",
  );
  const [incomeCategory, setIncomeCategory] = useState(
    dashboardTestData.options.incomeCategories[0] ?? "",
  );
  const [expenseCategory, setExpenseCategory] = useState(
    dashboardTestData.options.expenseCategories[0] ?? "",
  );
  const [transferCategory, setTransferCategory] = useState(
    transferCategories[0],
  );
  const [accountIsOpen, setAccountIsOpen] = useState(false);
  const [typeIsOpen, setTypeIsOpen] = useState(false);

  const categories =
    transactionType === "INCOME"
      ? dashboardTestData.options.incomeCategories
      : transactionType === "EXPENSE"
        ? dashboardTestData.options.expenseCategories
        : transferCategories;
  const category =
    transactionType === "INCOME"
      ? incomeCategory
      : transactionType === "EXPENSE"
        ? expenseCategory
        : transferCategory;

  const selectedAccount = useMemo(
    () =>
      dashboardTestData.accounts.find((account) => account.id === accountId),
    [accountId],
  );

  const categoryTotals =
    transactionType === "INCOME"
      ? dashboardTestData.summary.incomeByCategory
      : transactionType === "EXPENSE"
        ? dashboardTestData.summary.expenseByCategory
        : [];

  const selectedCategoryTotal =
    categoryTotals.find((item) => item.category === category)?.amount ?? 0;

  return (
    <div className="panel-surface h-fit w-full rounded-3xl p-4">
      <PillTabs
        active={transactionType}
        onChange={(v) => setTransactionType(v as TransactionType)}
        tabs={[
          { label: "Income", value: "INCOME" },
          { label: "Expense", value: "EXPENSE" },
          { label: "Transfer", value: "TRANSFER" },
        ]}
      />
      <div className="mt-3 w-full space-y-3">
        <div className="w-full relative">
          <div
            className="flex w-full cursor-pointer flex-col rounded-xl border border-[#d5e3da] bg-[#eef6f1] p-2.5"
            onClick={() => {
              setAccountIsOpen(!accountIsOpen);
              setTypeIsOpen(false);
            }}>
            <p className="text-xs uppercase tracking-[0.12em] text-[#547064]">
              Account
            </p>
            <p className="font-medium text-[#1d3b30]">
              {selectedAccount?.name ?? "-"}
            </p>
            <p className="text-end text-sm font-semibold text-[#2a4e42]">
              {formatYen(selectedAccount?.balance ?? 0)}
            </p>
          </div>
          {accountIsOpen && (
            <div className="absolute right-0 z-10 mt-2 flex w-[85%] flex-col gap-1 rounded-xl border border-[#c6d9ce] bg-white p-2 text-[#17352b] shadow-[0_10px_26px_rgba(15,40,29,0.14)]">
              {dashboardTestData.accounts.map((account) => (
                <button
                  className="cursor-pointer rounded-md px-2 py-1.5 text-left text-sm hover:bg-[#e9f3ed]"
                  key={account.id}
                  onClick={() => {
                    setAccountId(account.id);
                    setAccountIsOpen(false);
                  }}>
                  {account.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-full relative">
          <div
            className="flex w-full cursor-pointer flex-col rounded-xl border border-[#d5e3da] bg-[#f4faf6] p-2.5"
            onClick={() => {
              setTypeIsOpen(!typeIsOpen);
              setAccountIsOpen(false);
            }}>
            <p className="text-xs uppercase tracking-[0.12em] text-[#547064]">
              Category
            </p>
            <p className="font-medium text-[#1d3b30]">{category || "-"}</p>
            <p className="text-end text-sm font-semibold text-[#2a4e42]">
              {transactionType === "TRANSFER"
                ? "Internal movement"
                : formatYen(selectedCategoryTotal)}
            </p>
          </div>
          {typeIsOpen && (
            <div className="absolute right-0 z-10 mt-2 flex w-[85%] flex-col gap-1 rounded-xl border border-[#c6d9ce] bg-white p-2 text-[#17352b] shadow-[0_10px_26px_rgba(15,40,29,0.14)]">
              {categories.map((option) => (
                <button
                  className="cursor-pointer rounded-md px-2 py-1.5 text-left text-sm hover:bg-[#e9f3ed]"
                  key={option}
                  onClick={() => {
                    if (transactionType === "INCOME") {
                      setIncomeCategory(option);
                    } else if (transactionType === "EXPENSE") {
                      setExpenseCategory(option);
                    } else {
                      setTransferCategory(option);
                    }
                    setTypeIsOpen(false);
                  }}>
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
        <InputField
          label="Price"
          type="number"
          placeholder="Enter amount"
          alignEnd
          wrapperClassName="w-full rounded-xl border border-[#d4e3d9] bg-[#f4faf6] p-2.5"
        />
        <InputField
          label="Description"
          type="text"
          placeholder="Enter description"
          alignEnd
          wrapperClassName="w-full rounded-xl border border-[#d4e3d9] bg-[#f4faf6] p-2.5"
        />
        <div className="w-full rounded-xl border border-[#d4e3d9] bg-[#f4faf6] p-2.5">
          <p className="w-full text-xs font-medium uppercase tracking-[0.12em] text-[#4f665c]">
            Date
          </p>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-[#d5e3da] bg-white px-2.5 py-2 outline-none focus:border-[#65a48b]"
          />
        </div>
        <button className="mt-1 w-full cursor-pointer rounded-xl bg-linear-to-r from-[#2f8f70] to-[#2a7262] py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(35,108,86,0.25)] hover:brightness-105">
          Add Transaction
        </button>
      </div>
    </div>
  );
};

export default AddTransaction;
