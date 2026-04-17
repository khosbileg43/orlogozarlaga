import { cookies } from "next/headers";
import Link from "next/link";
import { getCopy } from "@/features/settings/copy";
import { preferencesCookieKey } from "@/features/settings/preferences";
import { getServerPreferences } from "@/features/settings/server-preferences";
import { isAuth0Configured } from "@/lib/auth/auth0";

type LoginPageProps = {
  searchParams?: Promise<{
    returnTo?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = await cookies();
  const preferences = getServerPreferences(
    cookieStore.get(preferencesCookieKey)?.value,
  );
  const copy = getCopy(preferences?.language ?? "MN");
  const resolvedSearchParams = await searchParams;
  const rawReturnTo = Array.isArray(resolvedSearchParams?.returnTo)
    ? resolvedSearchParams?.returnTo[0]
    : resolvedSearchParams?.returnTo;
  const returnTo =
    rawReturnTo && rawReturnTo.startsWith("/")
      ? rawReturnTo
      : preferences?.landingPage ?? "/pocketDashboard";
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
  const signupHref = `/auth/login?screen_hint=signup&returnTo=${encodeURIComponent(
    returnTo,
  )}`;
  const signupCtaHref = isAuth0Configured ? signupHref : "/signup";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-375 items-center px-3 py-6 md:px-5">
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-6">
        <section className="panel-surface hidden rounded-3xl p-6 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="soft-text text-xs font-semibold uppercase tracking-[0.16em]">
              Orlogo Zarlaga
            </p>
            <h1 className="theme-heading mt-3 text-3xl font-semibold leading-tight">
              {copy.welcomeBackTitle}
            </h1>
            <p className="soft-text mt-2 max-w-sm text-sm leading-6">
              {copy.welcomeBackDescription}
            </p>
          </div>

          <div className="theme-user-card theme-text rounded-2xl p-4 text-sm">
            {copy.authReturnHint}
          </div>
        </section>

        <section className="panel-surface rounded-3xl p-4 sm:p-6">
          <div className="mb-5">
            <p className="soft-text text-xs font-semibold uppercase tracking-[0.16em]">
              {copy.loginEyebrow}
            </p>
            <h2 className="theme-heading mt-1 text-2xl font-semibold">
              {copy.loginTitle}
            </h2>
          </div>

          {isAuth0Configured ? (
            <div className="space-y-3">
              <a
                href={loginHref}
                className="theme-button-primary block w-full rounded-xl py-2.5 text-center text-sm font-semibold">
                {copy.continueWithAuth0}
              </a>

              <p className="theme-muted text-center text-sm">
                {copy.needPasswordHelp}{" "}
                <Link
                  href="/forgot-pass"
                  className="theme-icon font-medium hover:underline">
                  {copy.forgotPassword}
                </Link>
              </p>
            </div>
          ) : (
            <div className="theme-status-warning rounded-2xl p-4 text-sm leading-6">
              {copy.auth0NotConfigured}
            </div>
          )}

          <p className="theme-muted mt-4 text-center text-sm">
            {copy.newHere}{" "}
            <a href={signupCtaHref} className="theme-icon font-medium hover:underline">
              {copy.createAccountLink}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
