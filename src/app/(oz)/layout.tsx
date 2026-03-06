"use client";
import { useUser } from "@auth0/nextjs-auth0";
import { SquareUserRound } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    </div>
  );
}
