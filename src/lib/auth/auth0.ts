import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "oz_session";

export type AuthSession = {
  user: {
    sub: string;
    email: string;
    name: string;
  };
};

function parseSession(value?: string | null): AuthSession | null {
  if (!value) return null;

  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded) as AuthSession;
    if (!parsed?.user?.sub || !parsed?.user?.email) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function serializeSession(session: AuthSession) {
  return encodeURIComponent(JSON.stringify(session));
}

export function setSessionCookie(
  response: NextResponse,
  session: AuthSession,
): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: serializeSession(session),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

async function getCookieValueFromServerContext() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export const auth0 = {
  async middleware(_request?: NextRequest) {
    void _request;
    return NextResponse.next();
  },

  async getSession(request?: NextRequest): Promise<AuthSession | null> {
    if (request) {
      return parseSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    }

    const value = await getCookieValueFromServerContext();
    return parseSession(value);
  },
};
