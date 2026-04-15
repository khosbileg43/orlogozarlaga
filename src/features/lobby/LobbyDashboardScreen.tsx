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

function formatDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Pick date";
  }

  return date.toLocaleDateString("en-US", {
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
      <div className="panel-surface rounded-3xl p-6 text-sm text-[#4a6559]">
        Loading lobby...
      </div>
    );
  }

  if (!lobby || !summary) {
    return (
      <div className="panel-surface rounded-3xl p-6 text-sm text-[#4a6559]">
        {error ?? "Lobby not found"}
      </div>
    );
  }

  const activeMemberCount = members.filter((member) => member.status === "ACTIVE").length;
  const actionPanelTitle =
    activeTab === "MEMBERS" ? "Add member" : editingTransactionId ? "Edit transaction" : "Add transaction";
  const nextMonth = shiftMonth(month, 1);
  const previousMonth = shiftMonth(month, -1);

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
      <section className="panel-surface relative overflow-hidden rounded-3xl px-4 py-5">
        <div className="absolute inset-0 bg-linear-to-br from-[#fbfffd] via-transparent to-[#ddeee4]" />
        <div className="absolute -right-16 top-0 h-44 w-44 rounded-full bg-[#d8ece1]/70 blur-2xl" />
        <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[#d6e7eb]/60 blur-2xl" />
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <Link
                href="/lobby"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#2e5e54] hover:text-[#173a30]">
                <ArrowLeft size={16} />
                Back to lobby list
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d2e2d9] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5d766a]">
                  <Landmark size={13} />
                  Shared monthly fund
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d2e2d9] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5d766a]">
                  {formatMonthLabel(month)}
                </span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#173a30] sm:text-4xl">
                {lobby.name}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[#4a6559]">
                {lobby.description || "No description"}
              </p>
            </div>

            <div className="grid gap-2 rounded-[1.5rem] border border-[#d8e4dd] bg-white/80 px-4 py-4 text-sm text-[#355246] shadow-[0_10px_26px_rgba(24,61,47,0.06)] sm:min-w-60">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">Role</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef6f1] px-2.5 py-1 text-[11px] font-semibold text-[#214a3d]">
                  <ShieldCheck size={12} />
                  {lobby.role}
                </span>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">
                    Shared balance
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#173a30]">
                    {formatYen(summary.balanceTotal)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">
                    Members
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#173a30]">
                    {activeMemberCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Current balance"
              value={formatYen(summary.balanceTotal)}
              className="w-full bg-linear-to-br from-[#4ba17a] to-[#2e7964] text-[#f6fcf9]"
              valueClassName="text-2xl text-end"
            />
            <StatCard
              title={`Income · ${formatMonthLabel(month)}`}
              value={formatYen(summary.incomeTotal)}
              className="w-full bg-[#eef6f1] text-[#1f3a30]"
              valueClassName="text-2xl text-end"
            />
            <StatCard
              title={`Expense · ${formatMonthLabel(month)}`}
              value={formatYen(summary.expenseTotal)}
              className="w-full bg-[#e8f1f2] text-[#1f3a30]"
              valueClassName="text-2xl text-end"
            />
            <StatCard
              title="Members"
              value={String(activeMemberCount)}
              className="w-full bg-[#f8fcf9] text-[#1b332b]"
              valueClassName="text-2xl text-end"
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <PillTabs
              active={activeTab}
              onChange={(value) => setActiveTab(value as LobbyTab)}
              tabs={[
                { label: "Overview", value: "OVERVIEW" },
                { label: "Transactions", value: "TRANSACTIONS" },
                { label: "Members", value: "MEMBERS" },
              ]}
            />

            <div className="flex flex-col gap-2 sm:min-w-[280px]">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f8579]">
                Reporting month
              </p>
              <div className="flex items-center justify-between gap-2 rounded-[1.25rem] border border-[#d9e6de] bg-white/85 p-2 shadow-[0_10px_24px_rgba(24,61,47,0.06)]">
                <button
                  type="button"
                  onClick={() => setMonth(previousMonth)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dbe8e1] bg-[#f8fcf9] text-[#315347] transition hover:bg-[#edf5f0]">
                  <ChevronLeft size={16} />
                </button>

                <label className="relative flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#f5faf7] px-3 py-2 text-center">
                  <CalendarRange size={15} className="shrink-0 text-[#2e5e54]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#173a30]">
                      {formatMonthLabel(month)}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#6f8579]">
                      Select month
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dbe8e1] bg-[#f8fcf9] text-[#315347] transition hover:bg-[#edf5f0]">
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
                    <Coins className="text-[#2a5f58]" size={18} />
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#486156]">
                      Recent transactions
                    </p>
                  </div>

                  <div className="mt-3 space-y-2">
                    {summary.recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="rounded-2xl border border-[#d9e6de] bg-white/85 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                                  transaction.type === "INCOME"
                                    ? "bg-[#e8f5ef] text-[#1d694e]"
                                    : "bg-[#fff1e8] text-[#8a4d28]"
                                }`}>
                                {transaction.type === "INCOME" ? (
                                  <TrendingUp size={12} />
                                ) : (
                                  <TrendingDown size={12} />
                                )}
                                {transaction.type}
                              </span>
                              <p className="truncate font-semibold text-[#173a30]">
                                {transaction.category}
                              </p>
                            </div>
                            <p className="mt-2 text-sm text-[#4a6559]">
                              {formatMemberName(transaction.member.user)} |{" "}
                              {formatIsoDate(transaction.date)}
                            </p>
                          </div>
                          <p
                            className={`shrink-0 text-lg font-semibold ${
                              transaction.type === "EXPENSE"
                                ? "text-[#7a4727]"
                                : "text-[#1c5b48]"
                            }`}>
                            {transaction.type === "EXPENSE" ? "-" : "+"}
                            {formatYen(transaction.amount)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {!summary.recentTransactions.length ? (
                      <div className="rounded-xl border border-dashed border-[#cbdcd2] bg-white/70 px-3 py-5 text-center text-sm text-[#5a7166]">
                        No transactions in this month.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="panel-surface rounded-3xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#486156]">
                      Top contributors
                    </p>
                    <div className="mt-3 space-y-2">
                      {memberSummary.slice(0, 3).map((member) => (
                        <div
                          key={member.memberId}
                          className="rounded-2xl border border-[#d9e6de] bg-white/80 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#e8f1ec] text-sm font-semibold text-[#214a3d]">
                                {getMemberInitials({
                                  name: member.name,
                                  email: member.email,
                                })}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-[#173a30]">
                                  {member.name ?? member.email}
                                </p>
                                <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">
                                Net
                              </p>
                              <p className="text-sm font-semibold text-[#1c5b48]">
                                {formatYen(member.netTotal)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="rounded-xl bg-[#eef6f1] px-3 py-2">
                              <p className="text-[11px] uppercase tracking-[0.12em] text-[#6f8579]">
                                Income
                              </p>
                              <p className="mt-1 text-sm font-semibold text-[#1c5b48]">
                                {formatYen(member.incomeTotal)}
                              </p>
                            </div>
                            <div className="rounded-xl bg-[#fff2ea] px-3 py-2">
                              <p className="text-[11px] uppercase tracking-[0.12em] text-[#6f8579]">
                                Expense
                              </p>
                              <p className="mt-1 text-sm font-semibold text-[#7a4727]">
                                {formatYen(member.expenseTotal)}
                              </p>
                            </div>
                            <div className="rounded-xl bg-[#edf2f4] px-3 py-2">
                              <p className="text-[11px] uppercase tracking-[0.12em] text-[#6f8579]">
                                Count
                              </p>
                              <p className="mt-1 text-sm font-semibold text-[#355246]">
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
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#486156]">
                            Lobby settings
                          </p>
                          <p className="mt-1 text-sm text-[#4a6559]">
                            Rename or update the lobby description.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingLobby((current) => !current)}
                          className="rounded-lg border border-[#cadcd1] bg-white/70 px-3 py-2 text-xs font-medium text-[#365447] hover:bg-[#edf5f0]">
                          {editingLobby ? "Close" : "Edit"}
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
                            className="w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2 text-sm text-[#1d3b30] outline-none"
                            placeholder="Lobby name"
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
                            className="w-full resize-none rounded-xl border border-[#d5e3da] bg-white px-3 py-2 text-sm text-[#1d3b30] outline-none"
                            placeholder="Description"
                          />
                          <button
                            type="submit"
                            disabled={updatingLobby}
                            className="w-full rounded-xl bg-linear-to-r from-[#2f8f70] to-[#2a7262] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(35,108,86,0.22)] disabled:cursor-not-allowed disabled:opacity-70">
                            {updatingLobby ? "Saving..." : "Save lobby"}
                          </button>
                        </div>
                      ) : null}
                    </form>
                  ) : null}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-5">
                <div className="panel-surface rounded-3xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#486156]">
                    Income categories
                  </p>
                  <div className="mt-3 space-y-2">
                    {summary.incomeByCategory.map((item) => (
                      <StatCard
                        key={`income-${item.category}`}
                        title={item.category}
                        value={formatYen(item.amount)}
                        className="w-full bg-[#eef6f1] text-[#1f3a30]"
                        valueClassName="text-xl text-end"
                      />
                    ))}
                    {!summary.incomeByCategory.length ? (
                      <div className="rounded-xl border border-dashed border-[#cbdcd2] bg-white/70 px-3 py-5 text-center text-sm text-[#5a7166]">
                        No income categories yet.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="panel-surface rounded-3xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#486156]">
                    Expense categories
                  </p>
                  <div className="mt-3 space-y-2">
                    {summary.expenseByCategory.map((item) => (
                      <StatCard
                        key={`expense-${item.category}`}
                        title={item.category}
                        value={formatYen(item.amount)}
                        className="w-full bg-[#e8f1f2] text-[#1f3a30]"
                        valueClassName="text-xl text-end"
                      />
                    ))}
                    {!summary.expenseByCategory.length ? (
                      <div className="rounded-xl border border-dashed border-[#cbdcd2] bg-white/70 px-3 py-5 text-center text-sm text-[#5a7166]">
                        No expense categories yet.
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
                  <ReceiptText className="text-[#2a5f58]" size={18} />
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#486156]">
                    Lobby transactions
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
                          ? "bg-[#215c54] text-white shadow-[0_8px_18px_rgba(26,83,73,0.25)]"
                          : "bg-[#edf5f0] text-[#355246] hover:bg-[#dcebe2]"
                      }`}>
                      {filter === "ALL" ? "All" : filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-[1.65rem] border border-[#d9e6de] bg-white/90 p-4 shadow-[0_10px_24px_rgba(19,40,30,0.05)]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              transaction.type === "EXPENSE"
                                ? "bg-[#fff1e8] text-[#8a4d28]"
                                : "bg-[#e8f5ef] text-[#1d694e]"
                            }`}>
                            {transaction.type === "EXPENSE" ? (
                              <TrendingDown size={12} />
                            ) : (
                              <TrendingUp size={12} />
                            )}
                            {transaction.type}
                          </span>
                          <p className="font-semibold text-[#173a30]">{transaction.category}</p>
                        </div>
                        <p className="mt-1 text-sm text-[#4a6559]">
                          {formatMemberName(transaction.member.user)} |{" "}
                          {formatIsoDate(transaction.date)}
                        </p>
                        {transaction.description ? (
                          <p className="mt-1 text-sm text-[#4a6559]">
                            {transaction.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3 self-start md:self-center">
                        <p
                          className={`text-lg font-semibold ${
                            transaction.type === "EXPENSE"
                              ? "text-[#7a4727]"
                              : "text-[#1c5b48]"
                          }`}>
                          {transaction.type === "EXPENSE" ? "-" : "+"}
                          {formatYen(transaction.amount)}
                        </p>

                        {isOwner ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleTransactionEdit(transaction)}
                              className="rounded-lg border border-[#cadcd1] bg-white/70 px-3 py-2 text-xs font-medium text-[#365447] hover:bg-[#edf5f0]">
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleTransactionDelete(transaction.id)}
                              disabled={transactionSubmitting}
                              className="rounded-lg border border-[#ecd1c7] bg-[#fff4f1] px-3 py-2 text-xs font-medium text-[#8d3d2f] hover:bg-[#ffe8e1] disabled:cursor-not-allowed disabled:opacity-70">
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}

                {!filteredTransactions.length ? (
                  <div className="rounded-xl border border-dashed border-[#cbdcd2] bg-white/70 px-3 py-5 text-center text-sm text-[#5a7166]">
                    No transactions in this filter.
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {activeTab === "MEMBERS" ? (
            <section className="panel-surface rounded-3xl px-4 py-5">
              <div className="flex items-center gap-2">
                <Users className="text-[#2a5f58]" size={18} />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#486156]">
                  Lobby members
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-[1.65rem] border border-[#d9e6de] bg-white/90 p-4 shadow-[0_10px_24px_rgba(19,40,30,0.05)]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e8f1ec] text-sm font-semibold text-[#214a3d]">
                          {getMemberInitials(member.user)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#173a30]">
                            {formatMemberName(member.user)}
                          </p>
                          <p className="mt-1 truncate text-sm text-[#4a6559]">
                            {member.user.email}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#eef6f1] px-2.5 py-1 text-[11px] font-semibold text-[#214a3d]">
                              {member.role}
                            </span>
                            <span className="rounded-full bg-[#edf2f4] px-2.5 py-1 text-[11px] font-semibold text-[#4d6571]">
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
                          className="rounded-lg border border-[#ecd1c7] bg-[#fff4f1] px-3 py-2 text-xs font-medium text-[#8d3d2f] hover:bg-[#ffe8e1] disabled:cursor-not-allowed disabled:opacity-70">
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}

                {!members.length ? (
                  <div className="rounded-xl border border-dashed border-[#cbdcd2] bg-white/70 px-3 py-5 text-center text-sm text-[#5a7166]">
                    No members found.
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="order-2 min-w-0 xl:sticky xl:top-6 xl:h-fit xl:self-start">
          <div className="panel-surface relative overflow-hidden rounded-3xl p-4">
            <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#eaf5ef] to-transparent" />
            <div className="flex items-center gap-2">
              {activeTab === "MEMBERS" ? (
                <UserPlus className="text-[#2a5f58]" size={18} />
              ) : (
                <ArrowUpRight className="text-[#2a5f58]" size={18} />
              )}
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#486156]">
                {actionPanelTitle}
              </p>
            </div>
            <p className="relative mt-2 text-sm leading-6 text-[#567065]">
              {activeTab === "MEMBERS"
                ? "Manage who participates in the shared monthly fund."
                : editingTransactionId
                  ? "Update the selected shared-fund transaction."
                  : "Record a new income or expense against the lobby balance."}
            </p>

            {activeTab === "MEMBERS" ? (
              isOwner ? (
                <form onSubmit={handleMemberSubmit} className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#547064]">
                      Member email
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
                      className="w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2 text-sm text-[#1d3b30] outline-none"
                    />
                  </label>

                  <p className="text-xs leading-5 text-[#5c7367]">
                    The user must already have an account in the app.
                  </p>

                  <div className="rounded-xl border border-[#d5e3da] bg-[#f4faf6] p-2.5">
                    <p className="text-xs uppercase tracking-[0.12em] text-[#547064]">Role</p>
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
                              ? "bg-[#1e4f48] text-white"
                              : "border border-[#d5e3da] bg-white text-[#2f4b41]"
                          }`}>
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={memberSubmitting}
                    className="w-full rounded-xl bg-linear-to-r from-[#2f8f70] to-[#2a7262] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(35,108,86,0.22)] disabled:cursor-not-allowed disabled:opacity-70">
                    {memberSubmitting ? "Adding..." : "Add member"}
                  </button>
                </form>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-[#cbdcd2] bg-white/70 px-3 py-5 text-center text-sm text-[#5a7166]">
                  Only lobby owners can add or remove members.
                </div>
              )
            ) : (
              <form onSubmit={handleTransactionSubmit} className="mt-4 space-y-3">
                {isOwner ? (
                  <div className="rounded-xl border border-[#d5e3da] bg-[#f4faf6] p-2.5">
                    <p className="text-xs uppercase tracking-[0.12em] text-[#547064]">
                      Member
                    </p>
                    <select
                      value={transactionForm.memberId}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          memberId: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-[#d5e3da] bg-white px-2.5 py-2 text-sm text-[#1d3b30] outline-none">
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {formatMemberName(member.user)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : currentMember ? (
                  <div className="rounded-xl border border-[#d5e3da] bg-[#f4faf6] p-2.5 text-sm text-[#355246]">
                    Recording as <span className="font-semibold">{formatMemberName(currentMember.user)}</span>
                  </div>
                ) : null}

                <div className="rounded-xl border border-[#d5e3da] bg-[#f4faf6] p-2.5">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#547064]">Type</p>
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
                            ? "bg-[#1e4f48] text-white"
                            : "border border-[#d5e3da] bg-white text-[#2f4b41]"
                        }`}>
                        {type}
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
                  placeholder="Category"
                  className="w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2 text-sm text-[#1d3b30] outline-none"
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
                  placeholder="Amount"
                  className="w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2 text-sm text-[#1d3b30] outline-none"
                />

                <label className="relative flex items-center justify-between gap-3 rounded-xl border border-[#d5e3da] bg-white px-3 py-2 text-left shadow-[0_10px_22px_rgba(24,61,47,0.04)]">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef6f1] text-[#2e5e54]">
                      <CalendarDays size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">
                        Transaction date
                      </p>
                      <p className="truncate text-sm font-semibold text-[#173a30]">
                        {formatDateLabel(transactionForm.date)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-[#6f8579]">
                    Change
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
                  placeholder="Description"
                  className="w-full resize-none rounded-xl border border-[#d5e3da] bg-white px-3 py-2 text-sm text-[#1d3b30] outline-none"
                />

                <button
                  type="submit"
                  disabled={transactionSubmitting || (!isOwner && !currentMember)}
                  className="w-full rounded-xl bg-linear-to-r from-[#2f8f70] to-[#2a7262] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(35,108,86,0.22)] disabled:cursor-not-allowed disabled:opacity-70">
                  {transactionSubmitting
                    ? "Saving..."
                    : editingTransactionId
                      ? "Save transaction"
                      : "Add transaction"}
                </button>

                {editingTransactionId ? (
                  <button
                    type="button"
                    onClick={resetTransactionForm}
                    className="w-full rounded-xl border border-[#cadcd1] bg-white/70 px-3 py-2 text-sm font-medium text-[#365447] hover:bg-[#edf5f0]">
                    Cancel edit
                  </button>
                ) : null}

                {!isOwner ? (
                  <p className="text-xs leading-5 text-[#5a7166]">
                    Members can create transactions for themselves. Owners can edit or
                    delete transactions for the whole lobby.
                  </p>
                ) : null}
              </form>
            )}

            {error ? (
              <div className="mt-4 rounded-2xl border border-[#f0c9a6] bg-[#fff7ef] p-4 text-sm leading-6 text-[#7a4a1d]">
                {error}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
