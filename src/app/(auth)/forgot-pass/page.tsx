import Link from "next/link";
import { isAuth0Configured } from "@/lib/auth/auth0";

export default function ForgotPassPage() {
  const loginHref = "/auth/login?returnTo=%2FpocketDashboard";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-375 items-center px-3 py-6 md:px-5">
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-6">
        <section className="panel-surface hidden rounded-3xl p-6 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="soft-text text-xs font-semibold uppercase tracking-[0.16em]">
              Password recovery
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#173a30]">
              {isAuth0Configured
                ? "Reset password through Auth0"
                : "Reset your password"}
            </h1>
            <p className="soft-text mt-2 max-w-sm text-sm leading-6">
              {isAuth0Configured
                ? "Auth0 Universal Login already includes password recovery, so the reset flow stays outside your app code."
                : "Configure Auth0 to use hosted password reset through Universal Login."}
            </p>
          </div>

          <div className="rounded-2xl border border-[#cfe0d6] bg-white/70 p-4 text-sm text-[#2d4b3f]">
            {isAuth0Configured
              ? "Open the hosted login screen and use the built-in Forgot password action there."
              : "After reset, sign in again to continue your dashboard."}
          </div>
        </section>

        <section className="panel-surface rounded-3xl p-4 sm:p-6">
          <div className="mb-5">
            <p className="soft-text text-xs font-semibold uppercase tracking-[0.16em]">
              Recovery
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#173a30]">
              Forgot password
            </h2>
          </div>

          {isAuth0Configured ? (
            <div className="space-y-3">
              <p className="text-sm leading-6 text-[#4a6559]">
                Continue to Auth0 login, then click the built-in password reset link.
              </p>

              <a
                href={loginHref}
                className="block w-full rounded-xl bg-linear-to-r from-[#2f8f70] to-[#2a7262] py-2.5 text-center text-sm font-semibold text-white shadow-[0_12px_24px_rgba(35,108,86,0.25)] hover:brightness-105">
                Continue to Auth0
              </a>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#f0c9a6] bg-[#fff7ef] p-4 text-sm leading-6 text-[#7a4a1d]">
              Password reset is handled only by Auth0 Universal Login. Add the Auth0
              environment variables, then use the hosted login screen.
            </div>
          )}

          <p className="mt-4 text-center text-sm text-[#4a6559]">
            Back to{" "}
            <Link href="/login" className="font-medium text-[#2e7964] hover:underline">
              Login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
