import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth/auth0";

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

export async function middleware(request: NextRequest) {
  const authResponse = await auth0.middleware(request);
  const pathname = request.nextUrl.pathname;

  // Public auth endpoints must remain accessible without session.
  if (
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/signup" ||
    pathname === "/api/auth/forgot-pass" ||
    pathname === "/api/auth/logout"
  ) {
    return authResponse;
  }

  if (!isProtectedPath(pathname)) {
    return authResponse;
  }

  const session = await auth0.getSession(request);
  if (!session) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
