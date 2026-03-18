"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SquareUserRound } from "lucide-react";
import React, { useEffect, useState } from "react";

const navLinks = [
  { name: "My Pocket", href: "/pocketDashboard" },
  { name: "Lobby", href: "/lobby" },
  { name: "Ur Zeel", href: "/urZeel" },
  { name: "Settings", href: "/settings" },
];

export default function OzLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload = (await response.json()) as {
          success: boolean;
          data?: { user?: { name?: string | null; email?: string | null } };
        };

        if (!mounted || !response.ok || !payload.success) return;
        const name =
          payload.data?.user?.name?.trim() ||
          payload.data?.user?.email ||
          "User";
        setDisplayName(name);
      } catch {
        if (mounted) setDisplayName("User");
      }
    };

    void loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  const onLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto flex w-full max-w-375 flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <aside className="panel-surface flex flex-col justify-between rounded-3xl px-4 py-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:px-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-[#8ea999] bg-[#f4fbf7] text-[17px] font-semibold tracking-wide text-[#244439]">
                OZ
              </div>
              <span className="soft-text text-[13px] font-semibold uppercase tracking-[0.18em]">
                orlogo-zarlaga
              </span>
            </div>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-visible">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    href={link.href}
                    key={link.name}
                    className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-[#1e4f48] text-white shadow-[0_8px_18px_rgba(20,66,60,0.26)]"
                        : "text-[#2f4b41] hover:bg-[#e7f0ea]"
                    }`}>
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 justify-between rounded-2xl border border-[#cfe0d6] bg-white/70 px-3 py-2.5">
            <div className="flex items-center gap-3">
              <SquareUserRound size={28} className="text-[#2e5e54]" />
              <p className="truncate text-sm font-medium text-[#25453b]">
                {displayName}
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="cursor-pointer rounded-xl border border-[#cfe0d6] bg-white/70 px-3 py-2 text-sm font-medium text-[#2f4b41] hover:bg-[#e7f0ea] disabled:cursor-not-allowed disabled:opacity-60">
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </aside>

        <section className="w-full min-w-0 flex-1">{children}</section>
      </div>
    </div>
  );
}
