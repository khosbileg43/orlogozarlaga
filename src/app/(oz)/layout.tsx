"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoonStar, SquareUserRound, SunMedium } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getCopy } from "@/features/settings/copy";
import { displayNameStorageKey } from "@/features/settings/preferences";
import { useUserPreferences } from "@/features/settings/useUserPreferences";

type MeResponse = {
  success: boolean;
  data?: {
    user?: {
      name?: string | null;
      email?: string | null;
    };
  };
};

export default function OzLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLobbySection =
    pathname === "/lobby" || pathname.startsWith("/lobby/");
  const { preferences, updatePreferences } = useUserPreferences();
  const copy = getCopy(preferences.language);
  const themeMode = preferences.theme === "DARK" ? "dark" : "light";
  const navLinks = [
    { name: copy.navPocket, href: "/pocketDashboard" },
    { name: copy.navLobby, href: "/lobby" },
    { name: copy.navDebt, href: "/urZeel" },
    { name: copy.navSettings, href: "/settings" },
  ];
  const [loggingOut, setLoggingOut] = useState(false);
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    let mounted = true;
    const frameId = window.requestAnimationFrame(() => {
      if (!mounted) return;

      const storedDisplayName = window.localStorage
        .getItem(displayNameStorageKey)
        ?.trim();
      if (storedDisplayName) {
        setDisplayName(storedDisplayName);
      }
    });

    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload = (await response.json()) as MeResponse;
        if (!mounted || !response.ok || !payload.success) return;

        const nextDisplayName =
          payload.data?.user?.name?.trim() ||
          payload.data?.user?.email ||
          "User";
        setDisplayName(nextDisplayName);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(displayNameStorageKey, nextDisplayName);
        }
      } catch {
        if (mounted) {
          setDisplayName("User");
        }
      }
    };

    const handleProfileUpdate = (event: Event) => {
      const nextDisplayName = (event as CustomEvent<{ displayName?: string }>)
        .detail?.displayName;
      if (nextDisplayName?.trim()) {
        setDisplayName(nextDisplayName);
      }
    };

    window.addEventListener("oz:user-profile-updated", handleProfileUpdate);
    void loadCurrentUser();

    return () => {
      mounted = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener(
        "oz:user-profile-updated",
        handleProfileUpdate,
      );
    };
  }, []);

  const handleLogout = async () => {
    if (typeof window === "undefined") return;

    setLoggingOut(true);
    const absoluteReturnTo = `${window.location.origin}/login`;
    window.location.assign(
      `/auth/logout?returnTo=${encodeURIComponent(absoluteReturnTo)}`,
    );
  };

  return (
    <div className="min-h-screen px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto flex w-full max-w-375 flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <aside className="panel-surface flex flex-col justify-between rounded-3xl px-4 py-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:px-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="theme-logo grid h-10 w-10 place-items-center rounded-lg border text-[17px] font-semibold tracking-wide">
                OZ
              </div>
              <span className="soft-text text-[13px] font-semibold uppercase tracking-[0.18em]">
                orlogo-zarlaga
              </span>
            </div>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-visible">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    href={link.href}
                    key={link.name}
                    className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium ${
                      isActive ? "theme-nav-link-active" : "theme-nav-link"
                    }`}>
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="theme-user-card mt-4 rounded-2xl p-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="theme-muted text-[11px] font-semibold uppercase tracking-[0.16em]">
                  {copy.appearance}
                </span>
                <span className="theme-muted text-[11px]">
                  {themeMode === "dark" ? copy.dark : copy.light}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updatePreferences({ theme: "LIGHT" })}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                    themeMode === "light"
                      ? "theme-chip theme-chip-active"
                      : "theme-button-secondary"
                  }`}>
                  <SunMedium size={16} />
                  {copy.light}
                </button>
                <button
                  type="button"
                  onClick={() => updatePreferences({ theme: "DARK" })}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                    themeMode === "dark"
                      ? "theme-chip theme-chip-active"
                      : "theme-button-secondary"
                  }`}>
                  <MoonStar size={16} />
                  {copy.dark}
                </button>
              </div>
            </div>
          </div>

          <div className="theme-user-card mt-6 flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <SquareUserRound size={28} className="theme-icon shrink-0" />
              <p className="theme-text truncate text-sm font-medium">
                {displayName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="theme-button-secondary shrink-0 cursor-pointer rounded-xl px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60">
              {loggingOut ? copy.loggingOut : copy.logout}
            </button>
          </div>
        </aside>

        <section className="w-full min-w-0 flex-1">{children}</section>
      </div>
    </div>
  );
}
