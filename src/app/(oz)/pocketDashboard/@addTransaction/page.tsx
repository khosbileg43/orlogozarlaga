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
import { getCopy } from "@/features/settings/copy";
import { useUserPreferences } from "@/features/settings/useUserPreferences";

const AddTransaction = () => {
  const {
    accounts,
    summary,
    editingTransaction,
    isLoadingAccounts,
    isSubmitting,
    error,
    cancelEditingTransaction,
    createTransaction,
    updateTransaction,
  } = useDashboard();
  const { preferences } = useUserPreferences();
  const copy = getCopy(preferences.language);
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

  React.useEffect(() => {
    if (!editingTransaction) {
      setTransactionType("INCOME");
      setAccountId("");
      setToAccountId("");
      setIncomeCategory(incomeCategories[0] ?? "");
      setExpenseCategory(expenseCategories[0] ?? "");
      setTransferCategory(transferCategories[0] ?? "");
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      setFormError(null);
      return;
    }

    setTransactionType(editingTransaction.type);
    setAccountId(editingTransaction.accountId);
    setToAccountId(editingTransaction.toAccountId ?? "");
    if (editingTransaction.type === "INCOME") {
      setIncomeCategory(editingTransaction.category);
    } else if (editingTransaction.type === "EXPENSE") {
      setExpenseCategory(editingTransaction.category);
    } else {
      setTransferCategory(editingTransaction.category);
    }
    setAmount(String(editingTransaction.amount));
    setDescription(editingTransaction.description ?? "");
    setDate(editingTransaction.date.slice(0, 10));
    setFormError(null);
  }, [editingTransaction]);

  async function handleSubmit() {
    setFormError(null);

    if (!editingTransaction && !effectiveAccountId) {
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

    if (!editingTransaction && transactionType === "TRANSFER" && !effectiveToAccountId) {
      setFormError("Please select a destination account.");
      return;
    }

    const categoryValue = category.trim();
    if (!categoryValue) {
      setFormError("Please select a category.");
      return;
    }

    const dateIso = new Date(`${date}T00:00:00.000Z`).toISOString();
    const success = editingTransaction
      ? await updateTransaction({
          transactionId: editingTransaction.id,
          accountId: effectiveAccountId,
          toAccountId: transactionType === "TRANSFER" ? effectiveToAccountId : null,
          type: transactionType,
          category: categoryValue,
          amount: amountValue,
          description: description.trim() || undefined,
          dateIso,
        })
      : await createTransaction({
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
    if (editingTransaction) {
      cancelEditingTransaction();
    }
  }

  return (
    <div className="panel-surface h-fit w-full rounded-3xl p-4">
      <PillTabs
        active={transactionType}
        onChange={(v) => setTransactionType(v as TransactionType)}
        tabs={[
          { label: copy.income, value: "INCOME" },
          { label: copy.expense, value: "EXPENSE" },
          { label: copy.transfer, value: "TRANSFER" },
        ]}
        containerClassName="theme-surface-soft grid w-full grid-cols-3 gap-1 rounded-xl p-1"
      />

      {editingTransaction ? (
        <div className="theme-surface-soft mt-3 rounded-xl px-3 py-2.5 text-sm">
          <p className="theme-muted text-xs uppercase tracking-[0.12em]">
            {copy.editTransaction}
          </p>
          <p className="theme-text mt-1 font-medium">
            {editingTransaction.description ?? editingTransaction.category}
          </p>
        </div>
      ) : null}

      <div className="mt-3 w-full space-y-3">
        <div className="relative w-full">
          <button
            type="button"
            disabled={!accounts.length || isLoadingAccounts}
            className="theme-surface-soft flex w-full cursor-pointer flex-col rounded-xl p-2.5 text-left disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => {
              setAccountIsOpen((open) => !open);
              setToAccountIsOpen(false);
              setTypeIsOpen(false);
            }}>
            <p className="theme-muted text-xs uppercase tracking-[0.12em]">
              {copy.account}
            </p>
            <p className="theme-text font-medium">
              {selectedAccount?.name ?? copy.selectAccount}
            </p>
            <p className="theme-text text-end text-sm font-semibold">
              {formatYen(
                selectedAccount?.balance ?? 0,
                preferences.currency,
                preferences.hideBalances,
              )}
            </p>
          </button>

          {accountIsOpen && (
            <div className="theme-dropdown absolute right-0 z-10 mt-2 flex w-[85%] flex-col gap-1 rounded-xl p-2">
              {accounts.map((account) => (
                <button
                  type="button"
                  className="theme-dropdown-item cursor-pointer rounded-md px-2 py-1.5 text-left text-sm"
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
              className="theme-surface-soft flex w-full cursor-pointer flex-col rounded-xl p-2.5 text-left disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => {
                setToAccountIsOpen((open) => !open);
                setAccountIsOpen(false);
                setTypeIsOpen(false);
              }}>
              <p className="theme-muted text-xs uppercase tracking-[0.12em]">
                {copy.toAccount}
              </p>
              <p className="theme-text font-medium">
                {selectedToAccount?.name ?? copy.selectDestination}
              </p>
              <p className="theme-text text-end text-sm font-semibold">
                {formatYen(
                  selectedToAccount?.balance ?? 0,
                  preferences.currency,
                  preferences.hideBalances,
                )}
              </p>
            </button>

            {toAccountIsOpen && (
              <div className="theme-dropdown absolute right-0 z-10 mt-2 flex w-[85%] flex-col gap-1 rounded-xl p-2">
                {destinationCandidates.map((account) => (
                  <button
                    type="button"
                    className="theme-dropdown-item cursor-pointer rounded-md px-2 py-1.5 text-left text-sm"
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
            className="theme-field-shell flex w-full cursor-pointer flex-col rounded-xl p-2.5 text-left"
            onClick={() => {
              setTypeIsOpen((open) => !open);
              setAccountIsOpen(false);
              setToAccountIsOpen(false);
            }}>
            <p className="theme-muted text-xs uppercase tracking-[0.12em]">
              {copy.category}
            </p>
            <p className="theme-text font-medium">{category || "-"}</p>
            <p className="theme-text text-end text-sm font-semibold">
              {transactionType === "TRANSFER"
                ? copy.internalMovement
                : formatYen(
                    selectedCategoryTotal,
                    preferences.currency,
                    preferences.hideBalances,
                  )}
            </p>
          </button>

          {typeIsOpen && (
            <div className="theme-dropdown absolute right-0 z-10 mt-2 flex w-[85%] flex-col gap-1 rounded-xl p-2">
              {categories.map((option) => (
                <button
                  type="button"
                  className="theme-dropdown-item cursor-pointer rounded-md px-2 py-1.5 text-left text-sm"
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
          label={copy.price}
          type="number"
          placeholder={copy.price}
          alignEnd
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          min={1}
          step={1}
          wrapperClassName="w-full rounded-xl p-2.5"
        />

        <InputField
          label={copy.description}
          type="text"
          placeholder={copy.description}
          alignEnd
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          wrapperClassName="w-full rounded-xl p-2.5"
        />

        <div className="theme-field-shell w-full rounded-xl p-2.5">
          <p className="theme-muted w-full text-xs font-medium uppercase tracking-[0.12em]">
            {copy.date}
          </p>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="theme-input mt-1 w-full rounded-lg px-2.5 py-2 outline-none"
          />
        </div>

        {(formError || error) && (
          <p className="theme-status-error rounded-lg px-2.5 py-2 text-xs">
            {formError ?? error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || isLoadingAccounts || !accounts.length}
          className="theme-button-primary mt-1 w-full cursor-pointer rounded-xl py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting
            ? copy.saving
            : editingTransaction
              ? copy.saveTransaction
              : copy.addTransaction}
        </button>

        {editingTransaction ? (
          <button
            type="button"
            onClick={cancelEditingTransaction}
            className="theme-button-secondary w-full rounded-xl py-2.5 text-sm font-medium">
            {copy.cancelEdit}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default AddTransaction;
