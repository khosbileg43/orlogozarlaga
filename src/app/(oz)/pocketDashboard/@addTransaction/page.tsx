"use client";

import React, { useMemo, useState } from "react";
import PillTabs from "@/components/ui/PillTabs";
import InputField from "@/components/ui/InputField";
import { useDashboard } from "@/features/dashboard/DashboardProvider";
import {
  expenseCategories,
  incomeCategories,
  transferCategories,
} from "@/features/dashboard/constants";
import { formatYen } from "@/features/dashboard/format";
import { TransactionType } from "@/features/dashboard/types";

const AddTransaction = () => {
  const {
    accounts,
    summary,
    isLoadingAccounts,
    isSubmitting,
    error,
    createTransaction,
  } = useDashboard();
  const [transactionType, setTransactionType] = useState<TransactionType>("INCOME");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [incomeCategory, setIncomeCategory] = useState(incomeCategories[0] ?? "");
  const [expenseCategory, setExpenseCategory] = useState(expenseCategories[0] ?? "");
  const [transferCategory, setTransferCategory] = useState(
    transferCategories[0] ?? "",
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [accountIsOpen, setAccountIsOpen] = useState(false);
  const [toAccountIsOpen, setToAccountIsOpen] = useState(false);
  const [typeIsOpen, setTypeIsOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const effectiveAccountId = accountId || accounts[0]?.id || "";
  const destinationCandidates = useMemo(
    () => accounts.filter((account) => account.id !== effectiveAccountId),
    [accounts, effectiveAccountId],
  );
  const effectiveToAccountId =
    toAccountId && toAccountId !== effectiveAccountId
      ? toAccountId
      : destinationCandidates[0]?.id || "";

  const categories =
    transactionType === "INCOME"
      ? incomeCategories
      : transactionType === "EXPENSE"
        ? expenseCategories
        : transferCategories;
  const category =
    transactionType === "INCOME"
      ? incomeCategory
      : transactionType === "EXPENSE"
        ? expenseCategory
        : transferCategory;

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === effectiveAccountId),
    [accounts, effectiveAccountId],
  );
  const selectedToAccount = useMemo(
    () => accounts.find((account) => account.id === effectiveToAccountId),
    [accounts, effectiveToAccountId],
  );

  const categoryTotals =
    transactionType === "INCOME"
      ? summary.incomeByCategory
      : transactionType === "EXPENSE"
        ? summary.expenseByCategory
        : [];
  const selectedCategoryTotal =
    categoryTotals.find((item) => item.category === category)?.amount ?? 0;

  async function handleSubmit() {
    setFormError(null);

    if (!effectiveAccountId) {
      setFormError("Please select an account.");
      return;
    }

    const amountValue = Number(amount);
    if (!Number.isInteger(amountValue) || amountValue <= 0) {
      setFormError("Amount must be a positive integer.");
      return;
    }

    if (!date) {
      setFormError("Please select a date.");
      return;
    }

    if (transactionType === "TRANSFER" && !effectiveToAccountId) {
      setFormError("Please select a destination account.");
      return;
    }

    const categoryValue = category.trim();
    if (!categoryValue) {
      setFormError("Please select a category.");
      return;
    }

    const dateIso = new Date(`${date}T00:00:00.000Z`).toISOString();
    const success = await createTransaction({
      accountId: effectiveAccountId,
      toAccountId: transactionType === "TRANSFER" ? effectiveToAccountId : undefined,
      type: transactionType,
      category: categoryValue,
      amount: amountValue,
      description: description.trim() || undefined,
      dateIso,
    });

    if (!success) {
      return;
    }

    setAmount("");
    setDescription("");
  }

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
        containerClassName="grid w-full grid-cols-3 gap-1 rounded-xl bg-[#e8f1ec] p-1"
      />

      <div className="mt-3 w-full space-y-3">
        <div className="relative w-full">
          <button
            type="button"
            disabled={!accounts.length || isLoadingAccounts}
            className="flex w-full cursor-pointer flex-col rounded-xl border border-[#d5e3da] bg-[#eef6f1] p-2.5 text-left disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => {
              setAccountIsOpen((open) => !open);
              setToAccountIsOpen(false);
              setTypeIsOpen(false);
            }}>
            <p className="text-xs uppercase tracking-[0.12em] text-[#547064]">
              Account
            </p>
            <p className="font-medium text-[#1d3b30]">
              {selectedAccount?.name ?? "Select account"}
            </p>
            <p className="text-end text-sm font-semibold text-[#2a4e42]">
              {formatYen(selectedAccount?.balance ?? 0)}
            </p>
          </button>

          {accountIsOpen && (
            <div className="absolute right-0 z-10 mt-2 flex w-[85%] flex-col gap-1 rounded-xl border border-[#c6d9ce] bg-white p-2 text-[#17352b] shadow-[0_10px_26px_rgba(15,40,29,0.14)]">
              {accounts.map((account) => (
                <button
                  type="button"
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

        {transactionType === "TRANSFER" && (
          <div className="relative w-full">
            <button
              type="button"
              disabled={!destinationCandidates.length}
              className="flex w-full cursor-pointer flex-col rounded-xl border border-[#d5e3da] bg-[#eef6f1] p-2.5 text-left disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => {
                setToAccountIsOpen((open) => !open);
                setAccountIsOpen(false);
                setTypeIsOpen(false);
              }}>
              <p className="text-xs uppercase tracking-[0.12em] text-[#547064]">
                To Account
              </p>
              <p className="font-medium text-[#1d3b30]">
                {selectedToAccount?.name ?? "Select destination"}
              </p>
              <p className="text-end text-sm font-semibold text-[#2a4e42]">
                {formatYen(selectedToAccount?.balance ?? 0)}
              </p>
            </button>

            {toAccountIsOpen && (
              <div className="absolute right-0 z-10 mt-2 flex w-[85%] flex-col gap-1 rounded-xl border border-[#c6d9ce] bg-white p-2 text-[#17352b] shadow-[0_10px_26px_rgba(15,40,29,0.14)]">
                {destinationCandidates.map((account) => (
                  <button
                    type="button"
                    className="cursor-pointer rounded-md px-2 py-1.5 text-left text-sm hover:bg-[#e9f3ed]"
                    key={account.id}
                    onClick={() => {
                      setToAccountId(account.id);
                      setToAccountIsOpen(false);
                    }}>
                    {account.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative w-full">
          <button
            type="button"
            className="flex w-full cursor-pointer flex-col rounded-xl border border-[#d5e3da] bg-[#f4faf6] p-2.5 text-left"
            onClick={() => {
              setTypeIsOpen((open) => !open);
              setAccountIsOpen(false);
              setToAccountIsOpen(false);
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
          </button>

          {typeIsOpen && (
            <div className="absolute right-0 z-10 mt-2 flex w-[85%] flex-col gap-1 rounded-xl border border-[#c6d9ce] bg-white p-2 text-[#17352b] shadow-[0_10px_26px_rgba(15,40,29,0.14)]">
              {categories.map((option) => (
                <button
                  type="button"
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
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          min={1}
          step={1}
          wrapperClassName="w-full rounded-xl border border-[#d4e3d9] bg-[#f4faf6] p-2.5"
        />

        <InputField
          label="Description"
          type="text"
          placeholder="Enter description"
          alignEnd
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          wrapperClassName="w-full rounded-xl border border-[#d4e3d9] bg-[#f4faf6] p-2.5"
        />

        <div className="w-full rounded-xl border border-[#d4e3d9] bg-[#f4faf6] p-2.5">
          <p className="w-full text-xs font-medium uppercase tracking-[0.12em] text-[#4f665c]">
            Date
          </p>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 w-full rounded-lg border border-[#d5e3da] bg-white px-2.5 py-2 outline-none focus:border-[#65a48b]"
          />
        </div>

        {(formError || error) && (
          <p className="rounded-lg border border-[#f2cccc] bg-[#fff3f3] px-2.5 py-2 text-xs text-[#8b3a3a]">
            {formError ?? error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || isLoadingAccounts || !accounts.length}
          className="mt-1 w-full cursor-pointer rounded-xl bg-linear-to-r from-[#2f8f70] to-[#2a7262] py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(35,108,86,0.25)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? "Saving..." : "Add Transaction"}
        </button>
      </div>
    </div>
  );
};

export default AddTransaction;
