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

function getRoleTone(role: LobbyListItem["role"]) {
  if (role === "OWNER") {
    return "bg-[#eef6f1] text-[#214a3d] border-[#d5e4da]";
  }

  return "bg-[#edf2f4] text-[#355246] border-[#d5dfe3]";
}

export default function LobbyListScreen() {
  const router = useRouter();
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
      <section className="panel-surface relative overflow-hidden rounded-3xl border border-[#d9e6de] px-5 py-6 sm:px-6 sm:py-7">
        <div className="absolute inset-0 bg-linear-to-br from-[#fbfffd] via-transparent to-[#ddeee4]" />
        <div className="absolute -right-16 top-0 h-44 w-44 rounded-full bg-[#d8ece1]/70 blur-2xl" />
        <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[#d6e7eb]/60 blur-2xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d2e2d9] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5d766a]">
                <Landmark size={13} />
                Shared funds
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d2e2d9] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5d766a]">
                <Sparkles size={13} />
                Lobby workspace
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#173a30] sm:text-4xl">
              Shared money, one dashboard per group.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4a6559] sm:text-base">
              Each lobby keeps one shared balance, one member roster, and one transaction
              history. Open a fund, review this month, and manage contributions and
              spending from the same dashboard shell as My Pocket.
            </p>
          </div>

          <div className="grid min-w-full grid-cols-1 gap-3 sm:min-w-0 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[#d8e4dd] bg-white/80 p-4 shadow-[0_10px_26px_rgba(24,61,47,0.06)]">
              <div className="flex items-center gap-2 text-[#2e5e54]">
                <Landmark size={16} />
                <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">Lobbies</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-[#173a30]">{lobbies.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#d8e4dd] bg-white/80 p-4 shadow-[0_10px_26px_rgba(24,61,47,0.06)]">
              <div className="flex items-center gap-2 text-[#2e5e54]">
                <Users size={16} />
                <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">Members</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-[#173a30]">
                {lobbies.reduce((sum, lobby) => sum + lobby.memberCount, 0)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[#d8e4dd] bg-white/80 p-4 shadow-[0_10px_26px_rgba(24,61,47,0.06)]">
              <div className="flex items-center gap-2 text-[#2e5e54]">
                <Wallet size={16} />
                <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">Balance</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-[#173a30]">
                {formatYen(lobbies.reduce((sum, lobby) => sum + lobby.balance, 0))}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="grid gap-4 xl:grid-cols-2">
          {!loading && lobbies.length === 0 ? (
            <div className="panel-surface rounded-3xl border border-[#d9e6de] p-6 text-sm text-[#4a6559] xl:col-span-2">
              <div className="flex items-center gap-2 text-[#2e5e54]">
                <Landmark size={18} />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#486156]">
                  No lobbies yet
                </p>
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-[#173a30]">
                Create your first shared fund.
              </h2>
              <p className="mt-2 max-w-xl leading-6">
                Start with one lobby for rent, groceries, travel, or any monthly shared
                budget. The creator is added as owner automatically.
              </p>
            </div>
          ) : null}

          {lobbies.map((lobby) => (
            <Link
              key={lobby.id}
              href={`/lobby/${lobby.id}`}
              className="group panel-surface relative overflow-hidden rounded-3xl border border-[#d9e6de] p-5 transition hover:-translate-y-0.5 hover:bg-white/90">
              <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-br from-[#f9fdfb] to-transparent opacity-90" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#d2e2d9] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5d766a]">
                        <Landmark size={12} />
                        Shared lobby
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getRoleTone(lobby.role)}`}>
                        <ShieldCheck size={12} className="mr-1" />
                        {lobby.role}
                      </span>
                    </div>
                    <h2 className="mt-4 truncate text-2xl font-semibold text-[#173a30]">
                      {lobby.name}
                    </h2>
                    <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#4a6559]">
                      {lobby.description || "No description yet."}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="mt-1 shrink-0 text-[#6f8579] transition group-hover:translate-x-0.5 group-hover:text-[#173a30]"
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#d9e6de] bg-white/85 p-3">
                    <div className="flex items-center gap-2 text-[#2e5e54]">
                      <Wallet size={16} />
                      <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">
                        Balance
                      </p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-[#173a30]">
                      {formatYen(lobby.balance)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d9e6de] bg-white/85 p-3">
                    <div className="flex items-center gap-2 text-[#2e5e54]">
                      <Users size={16} />
                      <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">
                        Members
                      </p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-[#173a30]">
                      {lobby.memberCount}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d9e6de] bg-white/85 p-3">
                    <div className="flex items-center gap-2 text-[#2e5e54]">
                      <Coins size={16} />
                      <p className="text-xs uppercase tracking-[0.12em] text-[#6f8579]">
                        Updated
                      </p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-[#173a30]">
                      {new Date(lobby.updatedAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#e2ece6] pt-4 text-sm">
                  <p className="text-[#5c7367]">Open dashboard</p>
                  <span className="font-medium text-[#173a30]">Review fund</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <aside className="panel-surface rounded-3xl border border-[#d9e6de] p-5 sm:p-6 lg:sticky lg:top-6">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-[#2f8f70] to-[#2a7262] text-white shadow-[0_10px_22px_rgba(35,108,86,0.22)]">
              <Plus size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f8579]">
                Create Lobby
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#173a30]">
                Open a new shared fund.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#4a6559]">
                This uses the real lobbies API. The authenticated user becomes the owner
                automatically and can add members from inside the lobby dashboard.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#eef6f1] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#6f8579]">Best for</p>
              <p className="mt-1 text-sm font-semibold text-[#173a30]">Rent, food, trips</p>
            </div>
            <div className="rounded-2xl bg-[#e8f1f2] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#6f8579]">Members</p>
              <p className="mt-1 text-sm font-semibold text-[#173a30]">Owner + shared roster</p>
            </div>
          </div>

          <form className="mt-5 grid gap-3" onSubmit={handleCreateLobby}>
            <InputField
              label="Lobby name"
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
              label="Description"
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
              <p className="rounded-xl border border-[#f1cdcd] bg-[#fff6f6] px-3 py-2 text-sm text-[#b93838]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#173a30] to-[#21483c] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(23,58,48,0.22)] transition hover:from-[#21483c] hover:to-[#285244] disabled:cursor-not-allowed disabled:opacity-70">
              <Plus size={16} />
              {submitting ? "Creating..." : "Create lobby"}
            </button>
          </form>
        </aside>
      </section>
    </div>
  );
}
