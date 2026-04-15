import Link from "next/link";
import { isAuth0Configured } from "@/lib/auth/auth0";

export default function SignupPage() {
  const signupHref = "/auth/login?screen_hint=signup&returnTo=%2FpocketDashboard";

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

          {isAuth0Configured ? (
            <div className="space-y-3">
              <a
                href={signupHref}
                className="block w-full rounded-xl bg-linear-to-r from-[#2f8f70] to-[#2a7262] py-2.5 text-center text-sm font-semibold text-white shadow-[0_12px_24px_rgba(35,108,86,0.25)] hover:brightness-105">
                Continue to Auth0 sign up
              </a>

              <p className="text-center text-sm text-[#4a6559]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#2e7964] hover:underline">
                  Login
                </Link>
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#f0c9a6] bg-[#fff7ef] p-4 text-sm leading-6 text-[#7a4a1d]">
              Auth0 is not configured. Configure Auth0 first, then use hosted sign up from
              this page.
            </div>
          )}

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
