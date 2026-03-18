import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { logger } from "@/utils/logger";

const protectedPrefixes = [
  "/pocketDashboard",
  "/lobby",
  "/urZeel",
  "/settings",
  "/api",
];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  const startedAt = Date.now();
  const pathname = request.nextUrl.pathname;

  // Public auth endpoints must remain accessible without session.
  if (
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/signup" ||
    pathname === "/api/auth/forgot-pass" ||
    pathname === "/api/auth/logout"
  ) {
    logger.info("proxy.pass.publicAuth", {
      path: pathname,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    logger.info("proxy.pass.public", {
      path: pathname,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.next();
  }

  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);
    logger.warn("proxy.redirect.unauthorized", {
      path: pathname,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.redirect(loginUrl);
  }

  logger.info("proxy.pass.protected", {
    path: pathname,
    durationMs: Date.now() - startedAt,
  });
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
