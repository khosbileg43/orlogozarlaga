"use client";

import {
  BellRing,
  ChartNoAxesCombined,
  Globe2,
  LayoutGrid,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WalletCards,
} from "lucide-react";
import React, { useMemo, useState } from "react";

type SettingsState = {
  language: "MN" | "EN";
  currency: "JPY" | "MNT" | "USD";
  monthStart: "1" | "25";
  dashboardDensity: "BALANCED" | "COMPACT";
  hideBalances: boolean;
  spendingAlerts: boolean;
  weeklyDigest: boolean;
  goalReminders: boolean;
  reminderTime: "08:00" | "18:00" | "21:00";
  threshold: "50000" | "100000" | "250000";
  sessionTimeout: "30" | "120" | "1440";
  deviceAlerts: boolean;
  landingPage: "/pocketDashboard" | "/lobby" | "/settings";
  defaultAccount: "Cash" | "Yuuchou ginkou" | "Mongol Bank";
  exportFormat: "CSV" | "JSON";
  transferLabel: string;
};

const initialState: SettingsState = {
  language: "MN",
  currency: "JPY",
  monthStart: "1",
  dashboardDensity: "BALANCED",
  hideBalances: false,
  spendingAlerts: true,
  weeklyDigest: true,
  goalReminders: false,
  reminderTime: "18:00",
  threshold: "100000",
  sessionTimeout: "120",
  deviceAlerts: true,
  landingPage: "/pocketDashboard",
  defaultAccount: "Cash",
  exportFormat: "CSV",
  transferLabel: "Between accounts",
};

function SectionCard({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel-surface rounded-[28px] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#cfe0d6] bg-[#f4fbf7] text-[#295a50]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="soft-text text-[11px] font-semibold uppercase tracking-[0.18em]">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#173a30]">{title}</h2>
          <p className="soft-text mt-1 text-sm leading-6">{description}</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

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
      className={`rounded-xl px-3 py-2 text-sm font-medium ${
        active
          ? "bg-[#1f5f55] text-white shadow-[0_10px_20px_rgba(24,82,71,0.22)]"
          : "bg-[#ecf4ef] text-[#335144] hover:bg-[#dceae1]"
      }`}>
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#d8e4dd] bg-[#f8fcf9] px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#18352c]">{label}</p>
        <p className="soft-text text-xs leading-5">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative h-7 w-13 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#2f8f70]" : "bg-[#d5e3da]"
        }`}>
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_4px_10px_rgba(13,38,29,0.18)] transition-all ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function FieldShell({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-[#d8e4dd] bg-white/75 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#527064]">
          {label}
        </p>
        {hint ? <p className="soft-text text-[11px]">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(initialState);
  const [statusText, setStatusText] = useState(
    "Preview mode: changes stay local until backend settings are wired.",
  );

  const hasChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(initialState),
    [settings],
  );

  const quickStatus = [
    settings.language === "MN" ? "Mongolian UI" : "English UI",
    settings.currency,
    settings.weeklyDigest ? "Weekly digest on" : "Weekly digest off",
    settings.hideBalances ? "Balances hidden" : "Balances visible",
  ];

  function savePreview() {
    setStatusText("Frontend preview saved locally. Backend persistence can be wired next.");
  }

  function resetPreview() {
    setSettings(initialState);
    setStatusText("Preview reset to the base setup.");
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="panel-surface overflow-hidden rounded-[32px]">
        <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.2fr)_340px]">
          <div className="space-y-4">
            <div>
              <p className="soft-text text-xs font-semibold uppercase tracking-[0.18em]">
                Settings
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#16372e]">
                    Tune the system around your money rhythm
                  </h1>
                  <p className="soft-text mt-2 max-w-2xl text-sm leading-6">
                    This pass is frontend-only, so the focus is hierarchy, clarity, and
                    interaction quality. The page keeps the same soft glass cards and
                    green-led accents as the rest of the dashboard.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#cfe0d6] bg-[#f4fbf7] px-3 py-2 text-sm font-medium text-[#255247]">
                  Auth0 connected
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quickStatus.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#d9e5de] bg-white/78 px-3 py-3">
                  <p className="soft-text text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Active now
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#18382e]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-linear-to-br from-[#2f8f70] via-[#2a7b66] to-[#215b53] p-4 text-white shadow-[0_18px_38px_rgba(22,74,62,0.22)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Preview board
                </p>
                <h2 className="mt-1 text-2xl font-semibold">System profile</h2>
              </div>
              <Sparkles className="text-white/80" />
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-white/12 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                  Session policy
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Timeout after {Number(settings.sessionTimeout) / 60}h
                </p>
              </div>

              <div className="rounded-2xl bg-white/12 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                  Primary landing
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {settings.landingPage === "/pocketDashboard"
                    ? "My Pocket"
                    : settings.landingPage === "/lobby"
                      ? "Lobby"
                      : "Settings"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/12 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                  Transfer label
                </p>
                <p className="mt-1 text-sm font-semibold">{settings.transferLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.85fr)]">
        <div className="space-y-4">
          <SectionCard
            icon={<SlidersHorizontal size={20} />}
            eyebrow="Preferences"
            title="Interface defaults"
            description="These options shape how the dashboard feels before you even touch the data.">
            <div className="grid gap-4 lg:grid-cols-2">
              <FieldShell label="Language" hint="UI labels">
                <div className="flex flex-wrap gap-2">
                  <ChoiceButton
                    active={settings.language === "MN"}
                    label="Mongolian"
                    onClick={() => setSettings((current) => ({ ...current, language: "MN" }))}
                  />
                  <ChoiceButton
                    active={settings.language === "EN"}
                    label="English"
                    onClick={() => setSettings((current) => ({ ...current, language: "EN" }))}
                  />
                </div>
              </FieldShell>

              <FieldShell label="Currency" hint="Display mode">
                <div className="flex flex-wrap gap-2">
                  {(["JPY", "MNT", "USD"] as const).map((currency) => (
                    <ChoiceButton
                      key={currency}
                      active={settings.currency === currency}
                      label={currency}
                      onClick={() =>
                        setSettings((current) => ({ ...current, currency }))
                      }
                    />
                  ))}
                </div>
              </FieldShell>

              <FieldShell label="Month cycle" hint="Summary grouping">
                <div className="flex flex-wrap gap-2">
                  <ChoiceButton
                    active={settings.monthStart === "1"}
                    label="Start on 1st"
                    onClick={() => setSettings((current) => ({ ...current, monthStart: "1" }))}
                  />
                  <ChoiceButton
                    active={settings.monthStart === "25"}
                    label="Start on 25th"
                    onClick={() =>
                      setSettings((current) => ({ ...current, monthStart: "25" }))
                    }
                  />
                </div>
              </FieldShell>

              <FieldShell label="Density" hint="Panel spacing">
                <div className="flex flex-wrap gap-2">
                  <ChoiceButton
                    active={settings.dashboardDensity === "BALANCED"}
                    label="Balanced"
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        dashboardDensity: "BALANCED",
                      }))
                    }
                  />
                  <ChoiceButton
                    active={settings.dashboardDensity === "COMPACT"}
                    label="Compact"
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        dashboardDensity: "COMPACT",
                      }))
                    }
                  />
                </div>
              </FieldShell>
            </div>

            <ToggleRow
              label="Hide balance values by default"
              description="Useful when you open the dashboard in public or during screen sharing."
              checked={settings.hideBalances}
              onToggle={() =>
                setSettings((current) => ({
                  ...current,
                  hideBalances: !current.hideBalances,
                }))
              }
            />
          </SectionCard>

          <SectionCard
            icon={<BellRing size={20} />}
            eyebrow="Alerts"
            title="Reminder and notification shape"
            description="Control what deserves your attention and what should stay quiet.">
            <div className="grid gap-3">
              <ToggleRow
                label="Spending alerts"
                description="Notify when a single expense crosses your selected threshold."
                checked={settings.spendingAlerts}
                onToggle={() =>
                  setSettings((current) => ({
                    ...current,
                    spendingAlerts: !current.spendingAlerts,
                  }))
                }
              />

              <ToggleRow
                label="Weekly digest"
                description="A compact summary of movement, top categories, and account changes."
                checked={settings.weeklyDigest}
                onToggle={() =>
                  setSettings((current) => ({
                    ...current,
                    weeklyDigest: !current.weeklyDigest,
                  }))
                }
              />

              <ToggleRow
                label="Goal reminders"
                description="Nudge the user when saving targets or budgets start drifting."
                checked={settings.goalReminders}
                onToggle={() =>
                  setSettings((current) => ({
                    ...current,
                    goalReminders: !current.goalReminders,
                  }))
                }
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <FieldShell label="Reminder time" hint="Local time">
                <select
                  value={settings.reminderTime}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      reminderTime: event.target.value as SettingsState["reminderTime"],
                    }))
                  }
                  className="w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2.5 text-sm text-[#1c3b31] outline-none focus:border-[#65a48b]">
                  <option value="08:00">08:00</option>
                  <option value="18:00">18:00</option>
                  <option value="21:00">21:00</option>
                </select>
              </FieldShell>

              <FieldShell label="Large expense threshold" hint="Single transaction">
                <div className="flex flex-wrap gap-2">
                  {([
                    ["50000", "¥50k"],
                    ["100000", "¥100k"],
                    ["250000", "¥250k"],
                  ] as const).map(([value, label]) => (
                    <ChoiceButton
                      key={value}
                      active={settings.threshold === value}
                      label={label}
                      onClick={() =>
                        setSettings((current) => ({
                          ...current,
                          threshold: value,
                        }))
                      }
                    />
                  ))}
                </div>
              </FieldShell>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            icon={<ShieldCheck size={20} />}
            eyebrow="Security"
            title="Access and session posture"
            description="This app uses Auth0 for identity, so the main controls here are session-facing.">
            <div className="rounded-2xl border border-[#d7e4dc] bg-[#f7fbf8] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#17362d]">Authentication provider</p>
                  <p className="soft-text mt-1 text-xs leading-5">
                    Hosted login is active. Password reset and account lifecycle stay in
                    Auth0.
                  </p>
                </div>
                <div className="rounded-xl bg-[#1f5f55] px-3 py-2 text-xs font-semibold text-white">
                  Auth0
                </div>
              </div>
            </div>

            <FieldShell label="Session timeout" hint="Auto logout">
              <div className="flex flex-wrap gap-2">
                {([
                  ["30", "30 min"],
                  ["120", "2 hours"],
                  ["1440", "24 hours"],
                ] as const).map(([value, label]) => (
                  <ChoiceButton
                    key={value}
                    active={settings.sessionTimeout === value}
                    label={label}
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        sessionTimeout: value,
                      }))
                    }
                  />
                ))}
              </div>
            </FieldShell>

            <ToggleRow
              label="Email me on new device sign-in"
              description="A lightweight way to notice unusual access without cluttering the app."
              checked={settings.deviceAlerts}
              onToggle={() =>
                setSettings((current) => ({
                  ...current,
                  deviceAlerts: !current.deviceAlerts,
                }))
              }
            />
          </SectionCard>

          <SectionCard
            icon={<WalletCards size={20} />}
            eyebrow="Defaults"
            title="Data and export defaults"
            description="Shape the app's opening state and a few naming conventions before backend wiring starts.">
            <FieldShell label="Landing page" hint="After login">
              <div className="flex flex-wrap gap-2">
                {([
                  ["/pocketDashboard", "My Pocket"],
                  ["/lobby", "Lobby"],
                  ["/settings", "Settings"],
                ] as const).map(([value, label]) => (
                  <ChoiceButton
                    key={value}
                    active={settings.landingPage === value}
                    label={label}
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        landingPage: value,
                      }))
                    }
                  />
                ))}
              </div>
            </FieldShell>

            <FieldShell label="Default account" hint="New transaction">
              <select
                value={settings.defaultAccount}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    defaultAccount: event.target.value as SettingsState["defaultAccount"],
                  }))
                }
                className="w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2.5 text-sm text-[#1c3b31] outline-none focus:border-[#65a48b]">
                <option value="Cash">Cash</option>
                <option value="Yuuchou ginkou">Yuuchou ginkou</option>
                <option value="Mongol Bank">Mongol Bank</option>
              </select>
            </FieldShell>

            <FieldShell label="Transfer category label" hint="Internal moves">
              <input
                type="text"
                value={settings.transferLabel}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    transferLabel: event.target.value,
                  }))
                }
                placeholder="Between accounts"
                className="w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2.5 text-sm text-[#1c3b31] outline-none placeholder:text-[#7b9288] focus:border-[#65a48b]"
              />
            </FieldShell>

            <FieldShell label="Export format" hint="Future reports">
              <div className="flex flex-wrap gap-2">
                <ChoiceButton
                  active={settings.exportFormat === "CSV"}
                  label="CSV"
                  onClick={() =>
                    setSettings((current) => ({ ...current, exportFormat: "CSV" }))
                  }
                />
                <ChoiceButton
                  active={settings.exportFormat === "JSON"}
                  label="JSON"
                  onClick={() =>
                    setSettings((current) => ({ ...current, exportFormat: "JSON" }))
                  }
                />
              </div>
            </FieldShell>
          </SectionCard>

          <section className="panel-surface rounded-[28px] bg-linear-to-br from-[#eff6f2] to-[#f8fbf9] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#d4e2db] bg-white text-[#27584e]">
                <ChartNoAxesCombined size={20} />
              </div>
              <div>
                <p className="soft-text text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Frontend scope
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#18372e]">
                  What is ready for backend next
                </h2>
                <p className="soft-text mt-1 text-sm leading-6">
                  The page now has a stable information architecture: grouped controls,
                  clear primary actions, and responsive layout behavior. Backend wiring can
                  map directly onto this shape without redesigning the UI.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#d9e5de] bg-white/80 p-3">
                <div className="flex items-center gap-2 text-[#2b5b50]">
                  <Globe2 size={16} />
                  <p className="text-sm font-semibold">User prefs</p>
                </div>
                <p className="soft-text mt-2 text-xs leading-5">
                  Language, currency, month cycle, and landing route.
                </p>
              </div>

              <div className="rounded-2xl border border-[#d9e5de] bg-white/80 p-3">
                <div className="flex items-center gap-2 text-[#2b5b50]">
                  <BellRing size={16} />
                  <p className="text-sm font-semibold">Alert rules</p>
                </div>
                <p className="soft-text mt-2 text-xs leading-5">
                  Thresholds, digest schedule, and reminder toggles.
                </p>
              </div>

              <div className="rounded-2xl border border-[#d9e5de] bg-white/80 p-3">
                <div className="flex items-center gap-2 text-[#2b5b50]">
                  <LayoutGrid size={16} />
                  <p className="text-sm font-semibold">UI state</p>
                </div>
                <p className="soft-text mt-2 text-xs leading-5">
                  Density, balance visibility, and transfer naming.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="panel-surface sticky bottom-3 z-10 rounded-[28px] px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#17372d]">Settings preview status</p>
            <p className="soft-text text-sm leading-6">{statusText}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={resetPreview}
              disabled={!hasChanges}
              className="rounded-xl border border-[#cadcd1] bg-white/75 px-4 py-2.5 text-sm font-medium text-[#365447] hover:bg-[#edf5f0] disabled:cursor-not-allowed disabled:opacity-60">
              Reset preview
            </button>
            <button
              type="button"
              onClick={savePreview}
              className="rounded-xl bg-linear-to-r from-[#2f8f70] to-[#2a7262] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(35,108,86,0.24)] hover:brightness-105">
              Save local draft
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
