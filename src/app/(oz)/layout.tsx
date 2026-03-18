"use client";
import { useUser } from "@auth0/nextjs-auth0";
import { SquareUserRound } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardTestData } from "@/lib/test-data/dashboard";

const navLinks = [
  { name: "My Pocket", href: "/pocketDashboard" },
  { name: "Lobby", href: "/lobby" },
  { name: "Ur Zeel", href: "/urZeel" },
  { name: "Settings", href: "/settings" },
];
export default function OzLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const displayName = isLoading
    ? "Loading..."
    : user?.name ?? user?.nickname ?? user?.email ?? "User";

  return (
    <div className="flex justify-end">
      <div className="bg-[#1F2421] text-[#F1F3F2] p-5 w-1/5 fixed h-screen top-0 left-0 flex flex-col gap-15 ">
        <div className="flex gap-3 items-center ">
          <div className="bg-transparent rounded-[5px] border border-[#F1F3F2] w-9 h-9 flex items-center justify-center">
            <span className="text-[18px] uppercase">OZ</span>
          </div>
          <span className="text-[16px] uppercase">orlogo-zarlaga</span>
        </div>
        <div className="h-full w-full flex flex-col gap-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                href={link.href}
                key={link.name}
                className={`rounded-lg flex py-1 px-3 ${isActive ? "bg-[#4C504D]" : "bg-transparent"} `}>
                <p>{link.name}</p>
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex bg-transparent rounded-lg border border-[#F1F3F2] p-2 gap-1 items-center w-full">
            <SquareUserRound size={30} />
            <p className="truncate">{displayName}</p>
          </div>
          <Link
            href="/auth/logout"
            className="rounded-lg border border-[#F1F3F2] py-2 px-3 text-center hover:bg-[#4C504D]">
            Logout
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg border border-[#F1F3F2] py-2 px-3 text-center hover:bg-[#4C504D]">
            Login
          </Link>
        </div>
      </div>
      <main className="flex w-4/5 min-h-screen">{children}</main>
    <div className="min-h-screen px-3 py-4 md:px-5 md:py-6">
      <div className="mx-auto flex w-full max-w-375 flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <aside className="panel-surface flex flex-col justify-between rounded-3xl px-4 py-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-[#8ea999] bg-[#f4fbf7] text-[17px] font-semibold tracking-wide text-[#244439]">
              OZ
            </div>
            <span className="text-[13px] font-semibold uppercase tracking-[0.18em] soft-text">
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

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#cfe0d6] bg-white/70 px-3 py-2.5 lg:mt-auto">
            <SquareUserRound size={28} className="text-[#2e5e54]" />
            <p className="text-sm font-medium text-[#25453b]">
              {dashboardTestData.user.name}
            </p>
          </div>
        </aside>

        <section className="w-full min-w-0 flex-1">{children}</section>
      </div>
    </div>
  );
}
