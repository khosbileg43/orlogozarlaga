"use client";

import {
  CalendarRange,
  Coins,
  Globe2,
  LayoutGrid,
  Mail,
  MoonStar,
  ShieldCheck,
  SunMedium,
  SquareUserRound,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { getCopy } from "@/features/settings/copy";
import { displayNameStorageKey } from "@/features/settings/preferences";
import { useUserPreferences } from "@/features/settings/useUserPreferences";

type MeResponse = {
  success: boolean;
  data?: {
    user?: {
      id: string;
      email: string;
      name: string | null;
    };
  };
  error?: string;
  message?: string;
};

function ChoiceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
        active ? "theme-chip theme-chip-active" : "theme-chip"
      }`}>
      {label}
    </button>
  );
}

function TogglePill({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        backgroundColor: checked
          ? "var(--button-primary-start)"
          : "var(--chip-border)",
      }}
      className="relative h-7 w-13 shrink-0 rounded-full transition-colors">
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_4px_10px_rgba(13,38,29,0.18)] transition-all ${
          checked ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}

function FieldCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="theme-field-shell rounded-xl p-2.5">
      <div className="theme-muted flex items-center gap-2">
        {icon}
        <p className="text-xs font-medium uppercase tracking-[0.12em]">
          {label}
        </p>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { preferences, updatePreferences } = useUserPreferences();
  const copy = getCopy(preferences.language);
  const [name, setName] = useState("");
  const [initialName, setInitialName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const hasChanges = useMemo(
    () => name.trim() !== initialName.trim(),
    [name, initialName],
  );

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload = (await response.json()) as MeResponse;

        if (!response.ok || !payload.success || !payload.data?.user) {
          throw new Error(
            payload.message ?? payload.error ?? "Failed to load profile",
          );
        }

        if (!mounted) return;

        const nextName = payload.data.user.name ?? "";
        setName(nextName);
        setInitialName(nextName);
        setEmail(payload.data.user.email);
      } catch (loadError: unknown) {
        if (!mounted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load profile",
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setStatus(null);

    try {
      const normalizedName = name.trim();
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedName || null,
        }),
      });

      const payload = (await response.json()) as MeResponse;

      if (!response.ok || !payload.success || !payload.data?.user) {
        throw new Error(
          payload.message ?? payload.error ?? "Failed to save profile",
        );
      }

      const nextName = payload.data.user.name ?? "";
      const nextDisplayName =
        nextName.trim() || payload.data.user.email || "User";

      setName(nextName);
      setInitialName(nextName);
      setStatus(copy.saved);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(displayNameStorageKey, nextDisplayName);
        window.dispatchEvent(
          new CustomEvent("oz:user-profile-updated", {
            detail: { displayName: nextDisplayName },
          }),
        );
      }
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save profile",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setName(initialName);
    setError(null);
    setStatus(null);
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="panel-surface rounded-3xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="theme-muted text-xs font-semibold uppercase tracking-[0.14em]">
              {copy.settings}
            </p>
            <h1 className="theme-heading mt-1 text-2xl font-semibold">
              {copy.profileDefaults}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="theme-chip rounded-lg px-3 py-2 text-xs font-semibold">
              {preferences.currency}
            </div>
            <div className="theme-chip rounded-lg px-3 py-2 text-xs font-semibold">
              {copy.monthChip} {preferences.monthStart}
            </div>
            <div className="theme-chip rounded-lg px-3 py-2 text-xs font-semibold">
              {preferences.theme === "DARK" ? copy.dark : copy.light}
            </div>
            <div className="theme-chip rounded-lg px-3 py-2 text-xs font-semibold">
              {preferences.dashboardDensity === "COMPACT"
                ? copy.compact
                : copy.balanced}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="panel-surface flex flex-col gap-3 rounded-3xl p-4">
          <div className="flex items-center gap-2">
            <SquareUserRound className="theme-icon" size={18} />
            <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
              {copy.user}
            </p>
          </div>

          <FieldCard
            icon={<SquareUserRound size={15} />}
            label={copy.displayName}>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              disabled={isLoading || isSaving}
              placeholder={copy.displayName}
              className="theme-input w-full rounded-lg px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70"
            />
          </FieldCard>

          <FieldCard icon={<Mail size={15} />} label={copy.email}>
            <p className="theme-text text-sm font-medium">
              {isLoading ? copy.loading : email || "-"}
            </p>
          </FieldCard>

          <FieldCard icon={<ShieldCheck size={15} />} label={copy.login}>
            <p className="theme-text text-sm font-medium">Auth0</p>
          </FieldCard>

          {(error || status) && (
            <div
              className={`rounded-xl px-3 py-2 text-sm ${error ? "theme-status-error" : "theme-status-success"}`}>
              {error ?? status}
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges || isLoading || isSaving}
              className="theme-button-secondary rounded-lg px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60">
              {copy.reset}
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!hasChanges || isLoading || isSaving}
              className="theme-button-primary rounded-lg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? copy.saving : copy.save}
            </button>
          </div>
        </div>

        <div className="panel-surface flex flex-col gap-3 rounded-3xl p-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="theme-icon" size={18} />
            <p className="theme-muted text-xs font-semibold uppercase tracking-[0.12em]">
              {copy.preferences}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FieldCard icon={<Globe2 size={15} />} label={copy.language}>
              <div className="flex flex-wrap gap-2">
                <ChoiceButton
                  active={preferences.language === "MN"}
                  label={copy.mongolian}
                  onClick={() => updatePreferences({ language: "MN" })}
                />
                <ChoiceButton
                  active={preferences.language === "EN"}
                  label={copy.english}
                  onClick={() => updatePreferences({ language: "EN" })}
                />
              </div>
            </FieldCard>

            <FieldCard icon={<Coins size={15} />} label={copy.currency}>
              <div className="flex flex-wrap gap-2">
                {(["JPY", "MNT", "USD"] as const).map((currency) => (
                  <ChoiceButton
                    key={currency}
                    active={preferences.currency === currency}
                    label={currency}
                    onClick={() => updatePreferences({ currency })}
                  />
                ))}
              </div>
            </FieldCard>

            <FieldCard icon={<CalendarRange size={15} />} label={copy.monthStart}>
              <div className="flex flex-wrap gap-2">
                <ChoiceButton
                  active={preferences.monthStart === "1"}
                  label="1st"
                  onClick={() => updatePreferences({ monthStart: "1" })}
                />
                <ChoiceButton
                  active={preferences.monthStart === "25"}
                  label="25th"
                  onClick={() => updatePreferences({ monthStart: "25" })}
                />
              </div>
            </FieldCard>

            <FieldCard
              icon={
                preferences.theme === "DARK" ? (
                  <MoonStar size={15} />
                ) : (
                  <SunMedium size={15} />
                )
              }
              label={copy.appearance}>
              <div className="flex flex-wrap gap-2">
                <ChoiceButton
                  active={preferences.theme === "LIGHT"}
                  label={copy.light}
                  onClick={() => updatePreferences({ theme: "LIGHT" })}
                />
                <ChoiceButton
                  active={preferences.theme === "DARK"}
                  label={copy.dark}
                  onClick={() => updatePreferences({ theme: "DARK" })}
                />
              </div>
            </FieldCard>

            <FieldCard icon={<LayoutGrid size={15} />} label={copy.density}>
              <div className="flex flex-wrap gap-2">
                <ChoiceButton
                  active={preferences.dashboardDensity === "BALANCED"}
                  label={copy.balanced}
                  onClick={() =>
                    updatePreferences({ dashboardDensity: "BALANCED" })
                  }
                />
                <ChoiceButton
                  active={preferences.dashboardDensity === "COMPACT"}
                  label={copy.compact}
                  onClick={() =>
                    updatePreferences({ dashboardDensity: "COMPACT" })
                  }
                />
              </div>
            </FieldCard>

            <FieldCard icon={<LayoutGrid size={15} />} label={copy.landing}>
              <div className="flex flex-wrap gap-2">
                <ChoiceButton
                  active={preferences.landingPage === "/pocketDashboard"}
                  label={copy.navPocket}
                  onClick={() =>
                    updatePreferences({ landingPage: "/pocketDashboard" })
                  }
                />
                <ChoiceButton
                  active={preferences.landingPage === "/lobby"}
                  label={copy.navLobby}
                  onClick={() => updatePreferences({ landingPage: "/lobby" })}
                />
                <ChoiceButton
                  active={preferences.landingPage === "/settings"}
                  label={copy.navSettings}
                  onClick={() =>
                    updatePreferences({ landingPage: "/settings" })
                  }
                />
              </div>
            </FieldCard>

            <FieldCard
              icon={<ShieldCheck size={15} />}
              label={copy.hideBalances}>
              <div className="flex items-center justify-between gap-3">
                <p className="theme-text text-sm font-medium">
                  {preferences.hideBalances ? copy.enabled : copy.disabled}
                </p>
                <TogglePill
                  checked={preferences.hideBalances}
                  onToggle={() =>
                    updatePreferences((current) => ({
                      hideBalances: !current.hideBalances,
                    }))
                  }
                />
              </div>
            </FieldCard>
          </div>
        </div>
      </div>
    </div>
  );
}
