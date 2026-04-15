import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
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
  const authResponse = await auth0.middleware(request);

  if (!isProtectedPath(pathname)) {
    logger.info("proxy.pass.public", {
      path: pathname,
      durationMs: Date.now() - startedAt,
    });
    return authResponse;
  }

  const session = await auth0.getSession(request);
  if (!session) {
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
  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
