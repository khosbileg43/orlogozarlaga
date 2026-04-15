"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Coins,
  Landmark,
  ReceiptText,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import PillTabs from "@/components/ui/PillTabs";
import StatCard from "@/components/ui/StatCard";
import {
  createLobbyMember,
  createLobbyTransaction,
  deleteLobbyMember,
  deleteLobbyTransaction,
  getLobbyById,
  getLobbyMemberSummary,
  getLobbySummary,
  listLobbyMembers,
  listLobbyTransactions,
  updateLobby,
  updateLobbyTransaction,
} from "./api";
import {
  formatIsoDate,
  formatMonthLabel,
  formatYen,
} from "../dashboard/format";
import { getCopy } from "../settings/copy";
import { useUserPreferences } from "../settings/useUserPreferences";
import type {
  CreateLobbyTransactionInput,
  LobbyDetail,
  LobbyMember,
  LobbyMemberContribution,
  LobbySummary,
  LobbyTab,
  LobbyTransaction,
} from "./types";

type LobbyDashboardScreenProps = {
  lobbyId: string;
};

type MeResponse = {
  success: boolean;
  data?: {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
    };
  };
};

type TransactionFilter = "ALL" | "INCOME" | "EXPENSE";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getTodayIsoDate() {
  return `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`;
}

function formatDateLabel(value: string, locale: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Pick date";
  }

  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function shiftMonth(value: string, delta: number) {
  const [yearText, monthText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return getCurrentMonth();
  }

  const nextDate = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMemberName(member: { name: string | null; email: string }) {
  return member.name?.trim() || member.email;
}

function getMemberInitials(member: { name: string | null; email: string }) {
  const base = member.name?.trim() || member.email;
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function createInitialTransactionForm(): CreateLobbyTransactionInput {
  return {
    memberId: "",
    type: "INCOME",
    category: "",
    amount: 0,
    description: "",
    date: getTodayIsoDate(),
  };
}

export default function LobbyDashboardScreen({
  lobbyId,
}: LobbyDashboardScreenProps) {
  const { preferences } = useUserPreferences();
  const copy = getCopy(preferences.language);
  const locale = preferences.language === "MN" ? "mn-MN" : "en-US";
  const [month, setMonth] = useState(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<LobbyTab>("OVERVIEW");
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>("ALL");
  const [lobby, setLobby] = useState<LobbyDetail | null>(null);
  const [members, setMembers] = useState<LobbyMember[]>([]);
  const [summary, setSummary] = useState<LobbySummary | null>(null);
  const [memberSummary, setMemberSummary] = useState<LobbyMemberContribution[]>([]);
  const [transactions, setTransactions] = useState<LobbyTransaction[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionSubmitting, setTransactionSubmitting] = useState(false);
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [updatingLobby, setUpdatingLobby] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editingLobby, setEditingLobby] = useState(false);
  const [transactionForm, setTransactionForm] = useState<CreateLobbyTransactionInput>(
    createInitialTransactionForm(),
  );
  const [memberForm, setMemberForm] = useState({
    email: "",
    role: "MEMBER" as "OWNER" | "MEMBER",
  });
  const [lobbyForm, setLobbyForm] = useState({
    name: "",
    description: "",
  });

  const isOwner = lobby?.role === "OWNER";
  const currentMember =
    members.find((member) => member.userId === currentUserId && member.status === "ACTIVE") ??
    null;

  async function loadLobbyData(selectedMonth = month) {
    setLoading(true);
    try {
      const [
        nextLobby,
        nextMembers,
        nextSummary,
        nextMemberSummary,
        nextTransactions,
      ] = await Promise.all([
        getLobbyById(lobbyId),
        listLobbyMembers(lobbyId),
        getLobbySummary(lobbyId, selectedMonth),
        getLobbyMemberSummary(lobbyId, selectedMonth),
        listLobbyTransactions({
          lobbyId,
          month: selectedMonth,
          page: 1,
          limit: 50,
        }),
      ]);

      setLobby(nextLobby);
      setMembers(nextMembers);
      setSummary(nextSummary);
      setMemberSummary(nextMemberSummary);
      setTransactions(nextTransactions);
      setLobbyForm({
        name: nextLobby.name,
        description: nextLobby.description || "",
      });
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load lobby");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload = (await response.json()) as MeResponse;
        if (!mounted || !response.ok || !payload.success) return;

        const nextUserId = payload.data?.user?.id;
        if (nextUserId) {
          setCurrentUserId(nextUserId);
        }
      } catch {
        if (mounted) {
          setCurrentUserId(null);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    void loadLobbyData(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId, month]);

  useEffect(() => {
    const defaultMemberId = isOwner
      ? transactionForm.memberId || members[0]?.id || ""
      : currentMember?.id || members[0]?.id || "";

    if (defaultMemberId && transactionForm.memberId !== defaultMemberId) {
      setTransactionForm((current) => ({
        ...current,
        memberId: defaultMemberId,
      }));
    }
  }, [currentMember?.id, isOwner, members, transactionForm.memberId]);

  const filteredTransactions = transactions.filter((transaction) => {
    if (transactionFilter === "ALL") return true;
    return transaction.type === transactionFilter;
  });

  const resetTransactionForm = () => {
    setEditingTransactionId(null);
    setTransactionForm({
      ...createInitialTransactionForm(),
      memberId: isOwner ? members[0]?.id || "" : currentMember?.id || members[0]?.id || "",
    });
  };

  const handleTransactionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !transactionForm.memberId ||
      !transactionForm.category.trim() ||
      transactionForm.amount <= 0 ||
      !transactionForm.date
    ) {
      setError("Fill member, category, amount, and date.");
      return;
    }

    setTransactionSubmitting(true);
    try {
      if (editingTransactionId) {
        await updateLobbyTransaction(lobbyId, editingTransactionId, {
          ...transactionForm,
          category: transactionForm.category.trim(),
          description: transactionForm.description?.trim(),
        });
      } else {
        await createLobbyTransaction(lobbyId, {
          ...transactionForm,
          category: transactionForm.category.trim(),
          description: transactionForm.description?.trim(),
        });
      }

      await loadLobbyData(month);
      resetTransactionForm();
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to save transaction",
      );
    } finally {
      setTransactionSubmitting(false);
    }
  };

  const handleTransactionEdit = (transaction: LobbyTransaction) => {
    setActiveTab("TRANSACTIONS");
    setEditingTransactionId(transaction.id);
    setTransactionForm({
      memberId: transaction.memberId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || "",
      date: transaction.date,
    });
  };

  const handleTransactionDelete = async (transactionId: string) => {
    setTransactionSubmitting(true);
    try {
      await deleteLobbyTransaction(lobbyId, transactionId);
      await loadLobbyData(month);
      if (editingTransactionId === transactionId) {
        resetTransactionForm();
      }
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to delete transaction",
      );
    } finally {
      setTransactionSubmitting(false);
    }
  };

  const handleMemberSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memberForm.email.trim()) {
      setError("Email is required.");
      return;
    }

    setMemberSubmitting(true);
    try {
      await createLobbyMember(lobbyId, {
        email: memberForm.email.trim(),
        role: memberForm.role,
      });
      await loadLobbyData(month);
      setMemberForm({
        email: "",
        role: "MEMBER",
      });
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to add member");
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleMemberDelete = async (memberId: string) => {
    setMemberSubmitting(true);
    try {
      await deleteLobbyMember(lobbyId, memberId);
      await loadLobbyData(month);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to remove member");
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleLobbyUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lobbyForm.name.trim()) {
      setError("Lobby name is required.");
      return;
    }

    setUpdatingLobby(true);
    try {
      const updated = await updateLobby(lobbyId, {
        name: lobbyForm.name.trim(),
        description: lobbyForm.description.trim() || null,
      });
      setLobby(updated);
      setEditingLobby(false);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to update lobby");
    } finally {
      setUpdatingLobby(false);
    }
  };

  if (loading) {
    return (
      <div className="panel-surface theme-muted rounded-3xl p-6 text-sm">
        Loading lobby...
      </div>
    );
  }

  if (!lobby || !summary) {
    return (
      <div className="panel-surface theme-muted rounded-3xl p-6 text-sm">
        {error ?? "Lobby not found"}
      </div>
    );
  }

  const activeMemberCount = members.filter((member) => member.status === "ACTIVE").length;
  const actionPanelTitle =
    activeTab === "MEMBERS"
      ? copy.addMember
      : editingTransactionId
        ? copy.editTransaction
        : copy.addTransactionLobby;
  const nextMonth = shiftMonth(month, 1);
  const previousMonth = shiftMonth(month, -1);

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
      <section className="panel-surface lobby-hero relative overflow-hidden rounded-3xl px-4 py-5">
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <Link
                href="/lobby"
                className="theme-icon inline-flex items-center gap-2 text-sm font-medium hover:text-[var(--foreground-strong)]">
                <ArrowLeft size={16} />
                {copy.backToLobbyList}
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <span className="lobby-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  <Landmark size={13} />
                  {copy.sharedMonthlyFund}
                </span>
                <span className="lobby-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {formatMonthLabel(month, 1, locale)}
                </span>
              </div>
              <h1 className="theme-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                {lobby.name}
              </h1>
              <p className="theme-muted max-w-2xl text-sm leading-6">
                {lobby.description || copy.noDescription}
              </p>
            </div>

            <div className="lobby-card grid gap-2 rounded-[1.5rem] px-4 py-4 text-sm sm:min-w-60">
              <div className="flex items-center justify-between gap-3">
                <p className="theme-muted text-xs uppercase tracking-[0.12em]">{copy.role}</p>
                <span className="lobby-chip-owner inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                  <ShieldCheck size={12} />
                  {lobby.role}
                </span>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="theme-muted text-xs uppercase tracking-[0.12em]">
                    {copy.sharedBalance}
                  </p>
                  <p className="theme-heading mt-1 text-2xl font-semibold">
                    {formatYen(
                      summary.balanceTotal,
                      preferences.currency,
                      preferences.hideBalances,
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="theme-muted text-xs uppercase tracking-[0.12em]">
                    {copy.members}
                  </p>
                  <p className="theme-heading mt-1 text-lg font-semibold">
                    {activeMemberCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title={copy.currentBalance}
              value={formatYen(
                summary.balanceTotal,
                preferences.currency,
                preferences.hideBalances,
              )}
              className="theme-card-balance w-full"
              valueClassName="text-2xl text-end"
            />
            <StatCard
              title={`${copy.income} · ${formatMonthLabel(month, 1, locale)}`}
              value={formatYen(
                summary.incomeTotal,
                preferences.currency,
                preferences.hideBalances,
              )}
              className="theme-surface-soft w-full"
              valueClassName="text-2xl text-end"
            />
            <StatCard
              title={`${copy.expense} · ${formatMonthLabel(month, 1, locale)}`}
              value={formatYen(
                summary.expenseTotal,
                preferences.currency,
                preferences.hideBalances,
              )}
              className="theme-surface-soft w-full"
              valueClassName="text-2xl text-end"
            />
            <StatCard
              title={copy.members}
              value={String(activeMemberCount)}
              className="w-full"
              valueClassName="text-2xl text-end"
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <PillTabs
              active={activeTab}
              onChange={(value) => setActiveTab(value as LobbyTab)}
              tabs={[
                { label: copy.overview, value: "OVERVIEW" },
                { label: copy.transactions, value: "TRANSACTIONS" },
                { label: copy.members, value: "MEMBERS" },
              ]}
            />

            <div className="flex flex-col gap-2 sm:min-w-[280px]">
              <p className="theme-muted px-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                {copy.reportingMonth}
              </p>
              <div className="lobby-card flex items-center justify-between gap-2 rounded-[1.25rem] p-2">
                <button
                  type="button"
                  onClick={() => setMonth(previousMonth)}
                  className="theme-button-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl transition">
                  <ChevronLeft size={16} />
                </button>

                <label className="theme-surface-soft relative flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-center">
                  <CalendarRange size={15} className="theme-icon shrink-0" />
                  <div className="min-w-0">
                    <p className="theme-heading truncate text-sm font-semibold">
                      {formatMonthLabel(month, 1, locale)}
                    </p>
                    <p className="theme-muted text-[11px] uppercase tracking-[0.12em]">
                      {copy.selectMonth}
                    </p>
                  </div>
                  <input
                    type="month"
                    value={month}
                    onChange={(event) => setMonth(event.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Select reporting month"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setMonth(nextMonth)}
                  className="theme-button-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl transition">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid w-full grid-cols-1 gap-3 sm:gap-4 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-1 min-w-0 space-y-3 sm:space-y-4 lg:space-y-5">
          {activeTab === "OVERVIEW" ? (
            <>
              <section className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5">
                <div className="panel-surface rounded-3xl p-4">
                  <div className="flex items-center gap-2 px-1">
                    <Coins className="theme-icon" size={18} />
                    <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
                      {copy.recentTransactions}
                    </p>
                  </div>

                  <div className="mt-3 space-y-2">
                    {summary.recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="lobby-card rounded-2xl p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                                  transaction.type === "INCOME"
                                    ? "lobby-type-income"
                                    : "lobby-type-expense"
                                }`}>
                                {transaction.type === "INCOME" ? (
                                  <TrendingUp size={12} />
                                ) : (
                                  <TrendingDown size={12} />
                                )}
                                {transaction.type}
                              </span>
                              <p className="theme-heading truncate font-semibold">
                                {transaction.category}
                              </p>
                            </div>
                            <p className="theme-muted mt-2 text-sm">
                              {formatMemberName(transaction.member.user)} |{" "}
                              {formatIsoDate(transaction.date, locale)}
                            </p>
                          </div>
                          <p
                            className={`shrink-0 text-lg font-semibold ${
                              transaction.type === "EXPENSE"
                                ? "lobby-accent-expense"
                                : "lobby-accent-income"
                            }`}>
                            {transaction.type === "EXPENSE" ? "-" : "+"}
                            {formatYen(
                              transaction.amount,
                              preferences.currency,
                              preferences.hideBalances,
                            )}
                          </p>
                        </div>
                      </div>
                    ))}

                    {!summary.recentTransactions.length ? (
                      <div className="theme-empty-state rounded-xl px-3 py-5 text-center text-sm">
                        {copy.noTransactionsMonth}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="panel-surface rounded-3xl p-4">
                    <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
                      {copy.topContributors}
                    </p>
                    <div className="mt-3 space-y-2">
                      {memberSummary.slice(0, 3).map((member) => (
                        <div
                          key={member.memberId}
                          className="lobby-card rounded-2xl p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="theme-surface-soft lobby-accent-income grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-sm font-semibold">
                                {getMemberInitials({
                                  name: member.name,
                                  email: member.email,
                                })}
                              </div>
                              <div className="min-w-0">
                                <p className="theme-heading truncate font-medium">
                                  {member.name ?? member.email}
                                </p>
                                <p className="theme-muted text-xs uppercase tracking-[0.12em]">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="theme-muted text-xs uppercase tracking-[0.12em]">
                                {copy.net}
                              </p>
                              <p className="lobby-accent-income text-sm font-semibold">
                                {formatYen(
                                  member.netTotal,
                                  preferences.currency,
                                  preferences.hideBalances,
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="theme-surface-soft rounded-xl px-3 py-2">
                              <p className="theme-muted text-[11px] uppercase tracking-[0.12em]">
                                {copy.income}
                              </p>
                              <p className="lobby-accent-income mt-1 text-sm font-semibold">
                                {formatYen(
                                  member.incomeTotal,
                                  preferences.currency,
                                  preferences.hideBalances,
                                )}
                              </p>
                            </div>
                            <div className="theme-surface-soft rounded-xl px-3 py-2">
                              <p className="theme-muted text-[11px] uppercase tracking-[0.12em]">
                                {copy.expense}
                              </p>
                              <p className="lobby-accent-expense mt-1 text-sm font-semibold">
                                {formatYen(
                                  member.expenseTotal,
                                  preferences.currency,
                                  preferences.hideBalances,
                                )}
                              </p>
                            </div>
                            <div className="theme-surface-soft rounded-xl px-3 py-2">
                              <p className="theme-muted text-[11px] uppercase tracking-[0.12em]">
                                {copy.count}
                              </p>
                              <p className="theme-text mt-1 text-sm font-semibold">
                                {member.transactionCount}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isOwner ? (
                    <form
                      onSubmit={handleLobbyUpdate}
                      className="panel-surface rounded-3xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
                            {copy.lobbySettings}
                          </p>
                          <p className="theme-muted mt-1 text-sm">
                            {copy.lobbySettingsDescription}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingLobby((current) => !current)}
                          className="theme-button-secondary rounded-lg px-3 py-2 text-xs font-medium">
                          {editingLobby ? copy.close : copy.edit}
                        </button>
                      </div>

                      {editingLobby ? (
                        <div className="mt-3 space-y-3">
                          <input
                            type="text"
                            value={lobbyForm.name}
                            onChange={(event) =>
                              setLobbyForm((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                            className="theme-input w-full rounded-xl px-3 py-2 text-sm outline-none"
                            placeholder={copy.lobbyName}
                          />
                          <textarea
                            value={lobbyForm.description}
                            onChange={(event) =>
                              setLobbyForm((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                            rows={3}
                            className="theme-input w-full resize-none rounded-xl px-3 py-2 text-sm outline-none"
                            placeholder={copy.lobbyDescription}
                          />
                          <button
                            type="submit"
                            disabled={updatingLobby}
                            className="theme-button-primary w-full rounded-xl px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70">
                            {updatingLobby ? copy.saving : copy.saveLobby}
                          </button>
                        </div>
                      ) : null}
                    </form>
                  ) : null}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-5">
                <div className="panel-surface rounded-3xl p-4">
                  <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
                    {copy.incomeCategories}
                  </p>
                  <div className="mt-3 space-y-2">
                    {summary.incomeByCategory.map((item) => (
                      <StatCard
                        key={`income-${item.category}`}
                        title={item.category}
                        value={formatYen(
                          item.amount,
                          preferences.currency,
                          preferences.hideBalances,
                        )}
                        className="theme-surface-soft w-full"
                        valueClassName="text-xl text-end"
                      />
                    ))}
                    {!summary.incomeByCategory.length ? (
                      <div className="theme-empty-state rounded-xl px-3 py-5 text-center text-sm">
                        {copy.noIncomeCategories}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="panel-surface rounded-3xl p-4">
                  <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
                    {copy.expenseCategories}
                  </p>
                  <div className="mt-3 space-y-2">
                    {summary.expenseByCategory.map((item) => (
                      <StatCard
                        key={`expense-${item.category}`}
                        title={item.category}
                        value={formatYen(
                          item.amount,
                          preferences.currency,
                          preferences.hideBalances,
                        )}
                        className="theme-surface-soft w-full"
                        valueClassName="text-xl text-end"
                      />
                    ))}
                    {!summary.expenseByCategory.length ? (
                      <div className="theme-empty-state rounded-xl px-3 py-5 text-center text-sm">
                        {copy.noExpenseCategories}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            </>
          ) : null}

          {activeTab === "TRANSACTIONS" ? (
            <section className="panel-surface rounded-3xl px-4 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <ReceiptText className="theme-icon" size={18} />
                  <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
                    {copy.lobbyTransactions}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["ALL", "INCOME", "EXPENSE"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setTransactionFilter(filter)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        transactionFilter === filter
                          ? "theme-chip theme-chip-active"
                          : "theme-chip"
                      }`}>
                      {filter === "ALL"
                        ? copy.all
                        : filter === "INCOME"
                          ? copy.income
                          : copy.expense}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="lobby-card rounded-[1.65rem] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              transaction.type === "EXPENSE"
                                ? "lobby-type-expense"
                                : "lobby-type-income"
                            }`}>
                            {transaction.type === "EXPENSE" ? (
                              <TrendingDown size={12} />
                            ) : (
                              <TrendingUp size={12} />
                            )}
                            {transaction.type}
                          </span>
                          <p className="theme-heading font-semibold">{transaction.category}</p>
                        </div>
                        <p className="theme-muted mt-1 text-sm">
                          {formatMemberName(transaction.member.user)} |{" "}
                          {formatIsoDate(transaction.date, locale)}
                        </p>
                        {transaction.description ? (
                          <p className="theme-muted mt-1 text-sm">
                            {transaction.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3 self-start md:self-center">
                        <p
                          className={`text-lg font-semibold ${
                            transaction.type === "EXPENSE"
                              ? "lobby-accent-expense"
                              : "lobby-accent-income"
                          }`}>
                          {transaction.type === "EXPENSE" ? "-" : "+"}
                          {formatYen(
                            transaction.amount,
                            preferences.currency,
                            preferences.hideBalances,
                          )}
                        </p>

                        {isOwner ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleTransactionEdit(transaction)}
                              className="theme-button-secondary rounded-lg px-3 py-2 text-xs font-medium">
                              {copy.edit}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleTransactionDelete(transaction.id)}
                              disabled={transactionSubmitting}
                              className="theme-status-error rounded-lg px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-70">
                              {copy.delete}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}

                {!filteredTransactions.length ? (
                  <div className="theme-empty-state rounded-xl px-3 py-5 text-center text-sm">
                    {copy.noTransactions}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {activeTab === "MEMBERS" ? (
            <section className="panel-surface rounded-3xl px-4 py-5">
              <div className="flex items-center gap-2">
                <Users className="theme-icon" size={18} />
                <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
                  {copy.lobbyMembers}
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="lobby-card rounded-[1.65rem] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="theme-surface-soft lobby-accent-income grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-semibold">
                          {getMemberInitials(member.user)}
                        </div>
                        <div className="min-w-0">
                          <p className="theme-heading truncate font-semibold">
                            {formatMemberName(member.user)}
                          </p>
                          <p className="theme-muted mt-1 truncate text-sm">
                            {member.user.email}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="lobby-chip-owner rounded-full px-2.5 py-1 text-[11px] font-semibold">
                              {member.role}
                            </span>
                            <span className="lobby-chip-muted rounded-full px-2.5 py-1 text-[11px] font-semibold">
                              {member.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isOwner && member.id !== currentMember?.id ? (
                        <button
                          type="button"
                          onClick={() => void handleMemberDelete(member.id)}
                          disabled={memberSubmitting}
                          className="theme-status-error rounded-lg px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-70">
                          {copy.remove}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}

                {!members.length ? (
                  <div className="theme-empty-state rounded-xl px-3 py-5 text-center text-sm">
                    {copy.noMembersFound}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="order-2 min-w-0 xl:sticky xl:top-6 xl:h-fit xl:self-start">
          <div className="panel-surface relative overflow-hidden rounded-3xl p-4">
            <div className="theme-surface-soft absolute inset-x-0 top-0 h-24 opacity-45" />
            <div className="flex items-center gap-2">
              {activeTab === "MEMBERS" ? (
                <UserPlus className="theme-icon" size={18} />
              ) : (
                <ArrowUpRight className="theme-icon" size={18} />
              )}
              <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
                {actionPanelTitle}
              </p>
            </div>
            <p className="theme-muted relative mt-2 text-sm leading-6">
              {activeTab === "MEMBERS"
                ? copy.manageParticipants
                : editingTransactionId
                  ? copy.updateSelectedTransaction
                  : copy.recordNewTransaction}
            </p>

            {activeTab === "MEMBERS" ? (
              isOwner ? (
                <form onSubmit={handleMemberSubmit} className="mt-4 space-y-3">
                  <label className="block">
                    <span className="theme-muted mb-2 block text-xs font-semibold uppercase tracking-[0.12em]">
                      {copy.memberEmail}
                    </span>
                    <input
                      type="email"
                      value={memberForm.email}
                      onChange={(event) =>
                        setMemberForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="member@example.com"
                      className="theme-input w-full rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </label>

                  <p className="theme-muted text-xs leading-5">
                    {copy.userMustExist}
                  </p>

                  <div className="theme-field-shell rounded-xl p-2.5">
                    <p className="theme-muted text-xs uppercase tracking-[0.12em]">{copy.role}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {(["MEMBER", "OWNER"] as const).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() =>
                            setMemberForm((current) => ({
                              ...current,
                              role,
                            }))
                          }
                          className={`rounded-lg px-3 py-2 text-sm font-medium ${
                            memberForm.role === role
                              ? "theme-chip theme-chip-active"
                              : "theme-button-secondary"
                          }`}>
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={memberSubmitting}
                    className="theme-button-primary w-full rounded-xl px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70">
                    {memberSubmitting ? copy.adding : copy.addMember}
                  </button>
                </form>
              ) : (
                <div className="theme-empty-state mt-4 rounded-xl px-3 py-5 text-center text-sm">
                  {copy.onlyOwnersManageMembers}
                </div>
              )
            ) : (
              <form onSubmit={handleTransactionSubmit} className="mt-4 space-y-3">
                {isOwner ? (
                  <div className="theme-field-shell rounded-xl p-2.5">
                    <p className="theme-muted text-xs uppercase tracking-[0.12em]">
                      {copy.member}
                    </p>
                    <select
                      value={transactionForm.memberId}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          memberId: event.target.value,
                        }))
                      }
                      className="theme-input mt-1 w-full rounded-lg px-2.5 py-2 text-sm outline-none">
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {formatMemberName(member.user)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : currentMember ? (
                  <div className="theme-field-shell theme-text rounded-xl p-2.5 text-sm">
                    {copy.recordingAs}{" "}
                    <span className="font-semibold">{formatMemberName(currentMember.user)}</span>
                  </div>
                ) : null}

                <div className="theme-field-shell rounded-xl p-2.5">
                  <p className="theme-muted text-xs uppercase tracking-[0.12em]">{copy.type}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["INCOME", "EXPENSE"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setTransactionForm((current) => ({
                            ...current,
                            type,
                          }))
                        }
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          transactionForm.type === type
                            ? "theme-chip theme-chip-active"
                            : "theme-button-secondary"
                        }`}>
                        {type === "INCOME" ? copy.income : copy.expense}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={transactionForm.category}
                  onChange={(event) =>
                    setTransactionForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  placeholder={copy.category}
                  className="theme-input w-full rounded-xl px-3 py-2 text-sm outline-none"
                />

                <input
                  type="number"
                  min={1}
                  value={transactionForm.amount || ""}
                  onChange={(event) =>
                    setTransactionForm((current) => ({
                      ...current,
                      amount: Number(event.target.value),
                    }))
                  }
                  placeholder={copy.price}
                  className="theme-input w-full rounded-xl px-3 py-2 text-sm outline-none"
                />

                <label className="theme-card-default relative flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="theme-surface-soft theme-icon grid h-9 w-9 shrink-0 place-items-center rounded-xl">
                      <CalendarDays size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="theme-muted text-xs uppercase tracking-[0.12em]">
                        {copy.transactionDate}
                      </p>
                      <p className="theme-heading truncate text-sm font-semibold">
                        {formatDateLabel(transactionForm.date, locale)}
                      </p>
                    </div>
                  </div>
                  <p className="theme-muted shrink-0 text-[11px] uppercase tracking-[0.12em]">
                    {copy.change}
                  </p>
                  <input
                    type="date"
                    value={transactionForm.date.slice(0, 10)}
                    onChange={(event) =>
                      setTransactionForm((current) => ({
                        ...current,
                        date: `${event.target.value}T00:00:00.000Z`,
                      }))
                    }
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Select transaction date"
                  />
                </label>

                <textarea
                  value={transactionForm.description ?? ""}
                  onChange={(event) =>
                    setTransactionForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder={copy.description}
                  className="theme-input w-full resize-none rounded-xl px-3 py-2 text-sm outline-none"
                />

                <button
                  type="submit"
                  disabled={transactionSubmitting || (!isOwner && !currentMember)}
                  className="theme-button-primary w-full rounded-xl px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70">
                  {transactionSubmitting
                    ? copy.saving
                    : editingTransactionId
                      ? copy.saveTransaction
                      : copy.addTransactionLobby}
                </button>

                {editingTransactionId ? (
                  <button
                    type="button"
                    onClick={resetTransactionForm}
                    className="theme-button-secondary w-full rounded-xl px-3 py-2 text-sm font-medium">
                    {copy.cancelEdit}
                  </button>
                ) : null}

                {!isOwner ? (
                  <p className="theme-muted text-xs leading-5">
                    {copy.memberTransactionHelp}
                  </p>
                ) : null}
              </form>
            )}

            {error ? (
              <div className="theme-status-warning mt-4 rounded-2xl p-4 text-sm leading-6">
                {error}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
