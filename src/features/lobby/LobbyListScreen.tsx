"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Coins,
  Landmark,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import InputField from "@/components/ui/InputField";
import { createLobby, listLobbies } from "./api";
import type { LobbyListItem } from "./types";
import { formatYen } from "../dashboard/format";
import { getCopy } from "../settings/copy";
import { useUserPreferences } from "../settings/useUserPreferences";

function getRoleTone(role: LobbyListItem["role"]) {
  if (role === "OWNER") {
    return "lobby-chip-owner";
  }

  return "lobby-chip-muted";
}

export default function LobbyListScreen() {
  const router = useRouter();
  const { preferences } = useUserPreferences();
  const copy = getCopy(preferences.language);
  const locale = preferences.language === "MN" ? "mn-MN" : "en-US";
  const [lobbies, setLobbies] = useState<LobbyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    let mounted = true;

    const loadLobbies = async () => {
      try {
        const nextLobbies = await listLobbies();
        if (!mounted) return;
        setLobbies(nextLobbies);
        setError(null);
      } catch (caughtError) {
        if (mounted) {
          setError(caughtError instanceof Error ? caughtError.message : "Failed to load lobbies");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadLobbies();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateLobby = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Lobby name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const lobby = await createLobby({
        name: form.name,
        description: form.description,
      });

      setLobbies((current) => [lobby, ...current.filter((item) => item.id !== lobby.id)]);
      setForm({
        name: "",
        description: "",
      });
      setError(null);
      router.push(`/lobby/${lobby.id}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to create lobby");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <section className="panel-surface lobby-hero relative overflow-hidden rounded-3xl px-5 py-6 sm:px-6 sm:py-7">
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="lobby-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                <Landmark size={13} />
                {copy.sharedFunds}
              </span>
              <span className="lobby-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                <Sparkles size={13} />
                {copy.lobbyWorkspace}
              </span>
            </div>
            <h1 className="theme-heading mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {copy.sharedMoneyTitle}
            </h1>
            <p className="theme-muted mt-3 max-w-2xl text-sm leading-6 sm:text-base">
              {copy.sharedMoneyDescription}
            </p>
          </div>

          <div className="grid min-w-full grid-cols-1 gap-3 sm:min-w-0 sm:grid-cols-3">
            <div className="lobby-card rounded-[1.5rem] p-4">
              <div className="theme-icon flex items-center gap-2">
                <Landmark size={16} />
                <p className="theme-muted text-xs uppercase tracking-[0.12em]">{copy.lobbies}</p>
              </div>
              <p className="theme-heading mt-3 text-2xl font-semibold">{lobbies.length}</p>
            </div>
            <div className="lobby-card rounded-[1.5rem] p-4">
              <div className="theme-icon flex items-center gap-2">
                <Users size={16} />
                <p className="theme-muted text-xs uppercase tracking-[0.12em]">{copy.members}</p>
              </div>
              <p className="theme-heading mt-3 text-2xl font-semibold">
                {lobbies.reduce((sum, lobby) => sum + lobby.memberCount, 0)}
              </p>
            </div>
            <div className="lobby-card rounded-[1.5rem] p-4">
              <div className="theme-icon flex items-center gap-2">
                <Wallet size={16} />
                <p className="theme-muted text-xs uppercase tracking-[0.12em]">{copy.balance}</p>
              </div>
              <p className="theme-heading mt-3 text-2xl font-semibold">
                {formatYen(
                  lobbies.reduce((sum, lobby) => sum + lobby.balance, 0),
                  preferences.currency,
                  preferences.hideBalances,
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="grid gap-4 xl:grid-cols-2">
          {!loading && lobbies.length === 0 ? (
            <div className="panel-surface rounded-3xl p-6 text-sm xl:col-span-2">
              <div className="theme-icon flex items-center gap-2">
                <Landmark size={18} />
                <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
                  {copy.noLobbies}
                </p>
              </div>
              <h2 className="theme-heading mt-3 text-2xl font-semibold">
                {copy.createFirstFund}
              </h2>
              <p className="theme-muted mt-2 max-w-xl leading-6">
                {copy.createFirstFundDescription}
              </p>
            </div>
          ) : null}

          {lobbies.map((lobby) => (
            <Link
              key={lobby.id}
              href={`/lobby/${lobby.id}`}
              className="group panel-surface relative overflow-hidden rounded-3xl p-5 transition hover:-translate-y-0.5">
              <div className="theme-surface-soft absolute inset-x-0 top-0 h-24 opacity-40" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="lobby-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                        <Landmark size={12} />
                        {copy.sharedLobby}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getRoleTone(lobby.role)}`}>
                        <ShieldCheck size={12} className="mr-1" />
                        {lobby.role}
                      </span>
                    </div>
                    <h2 className="theme-heading mt-4 truncate text-2xl font-semibold">
                      {lobby.name}
                    </h2>
                    <p className="theme-muted mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6">
                      {lobby.description || copy.noDescriptionYet}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="theme-muted mt-1 shrink-0 transition group-hover:translate-x-0.5 group-hover:text-[var(--foreground-strong)]"
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="lobby-card rounded-2xl p-3">
                    <div className="theme-icon flex items-center gap-2">
                      <Wallet size={16} />
                      <p className="theme-muted text-xs uppercase tracking-[0.12em]">
                        {copy.balance}
                      </p>
                    </div>
                    <p className="theme-heading mt-2 text-lg font-semibold">
                      {formatYen(
                        lobby.balance,
                        preferences.currency,
                        preferences.hideBalances,
                      )}
                    </p>
                  </div>

                  <div className="lobby-card rounded-2xl p-3">
                    <div className="theme-icon flex items-center gap-2">
                      <Users size={16} />
                      <p className="theme-muted text-xs uppercase tracking-[0.12em]">
                        {copy.members}
                      </p>
                    </div>
                    <p className="theme-heading mt-2 text-lg font-semibold">
                      {lobby.memberCount}
                    </p>
                  </div>

                  <div className="lobby-card rounded-2xl p-3">
                    <div className="theme-icon flex items-center gap-2">
                      <Coins size={16} />
                      <p className="theme-muted text-xs uppercase tracking-[0.12em]">
                        {copy.updated}
                      </p>
                    </div>
                    <p className="theme-heading mt-2 text-lg font-semibold">
                      {new Date(lobby.updatedAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--surface-line)] pt-4 text-sm">
                  <p className="theme-muted">{copy.openDashboard}</p>
                  <span className="theme-heading font-medium">{copy.reviewFund}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <aside className="panel-surface rounded-3xl p-5 sm:p-6 lg:sticky lg:top-6">
          <div className="flex items-start gap-3">
            <div className="theme-button-primary grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white">
              <Plus size={20} />
            </div>
            <div>
              <p className="theme-muted text-xs font-semibold uppercase tracking-[0.16em]">
                {copy.createLobby}
              </p>
              <h2 className="theme-heading mt-2 text-2xl font-semibold">
                {copy.openSharedFund}
              </h2>
              <p className="theme-muted mt-2 text-sm leading-6">
                {copy.createLobbyDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="lobby-card-soft rounded-2xl px-4 py-3">
              <p className="theme-muted text-[11px] uppercase tracking-[0.12em]">{copy.bestFor}</p>
              <p className="theme-heading mt-1 text-sm font-semibold">{copy.bestForExamples}</p>
            </div>
            <div className="lobby-card-soft rounded-2xl px-4 py-3">
              <p className="theme-muted text-[11px] uppercase tracking-[0.12em]">{copy.members}</p>
              <p className="theme-heading mt-1 text-sm font-semibold">{copy.membersHint}</p>
            </div>
          </div>

          <form className="mt-5 grid gap-3" onSubmit={handleCreateLobby}>
            <InputField
              label={copy.lobbyName}
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="April Shared Fund"
            />

            <InputField
              label={copy.lobbyDescription}
              type="text"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Apartment monthly fund"
            />

            {error ? (
              <p className="theme-status-error rounded-xl px-3 py-2 text-sm">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="theme-button-primary inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70">
              <Plus size={16} />
              {submitting ? copy.creating : copy.createLobbyAction}
            </button>
          </form>
        </aside>
      </section>
    </div>
  );
}
