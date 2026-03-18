"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Sign up failed");
      }

      router.replace("/pocketDashboard");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Sign up failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-375 items-center px-3 py-6 md:px-5">
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-6">
        <section className="panel-surface hidden rounded-3xl p-6 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="soft-text text-xs font-semibold uppercase tracking-[0.16em]">
              Orlogo Zarlaga
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#173a30]">
              Build better money habits
            </h1>
            <p className="soft-text mt-2 max-w-sm text-sm leading-6">
              Create your account and start tracking all your income and expense flows
              from today.
            </p>
          </div>

          <div className="rounded-2xl border border-[#cfe0d6] bg-white/70 p-4 text-sm text-[#2d4b3f]">
            You can add accounts, monthly summaries and transaction categories.
          </div>
        </section>

        <section className="panel-surface rounded-3xl p-4 sm:p-6">
          <div className="mb-5">
            <p className="soft-text text-xs font-semibold uppercase tracking-[0.16em]">
              Get started
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#173a30]">Sign up</h2>
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#4f665c]">
                Full name
              </span>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2.5 outline-none focus:border-[#65a48b]"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#4f665c]">
                Email
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2.5 outline-none focus:border-[#65a48b]"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#4f665c]">
                Password
              </span>
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2.5 outline-none focus:border-[#65a48b]"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#4f665c]">
                Confirm password
              </span>
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#d5e3da] bg-white px-3 py-2.5 outline-none focus:border-[#65a48b]"
              />
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-linear-to-r from-[#2f8f70] to-[#2a7262] py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(35,108,86,0.25)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-[#4a6559]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#2e7964] hover:underline">
              Login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
