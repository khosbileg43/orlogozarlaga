import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth/constants";

const DEV_DEFAULT_SECRET = "dev-only-session-secret-change-me";

export type AuthSession = {
  user: {
    sub: string;
    email: string;
    name: string;
  };
};

type SessionTokenPayload = AuthSession & {
  iat: number;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET ?? process.env.AUTH0_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET (or AUTH0_SECRET) is required in production");
  }

  return DEV_DEFAULT_SECRET;
}

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

function constantTimeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function serializeSession(session: AuthSession) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    ...session,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = sign(unsigned, getSessionSecret());
  return `${unsigned}.${signature}`;
}

function parseSession(value?: string | null): AuthSession | null {
  if (!value) return null;

  try {
    const [encodedHeader, encodedPayload, signature] = value.split(".");
    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }

    const unsigned = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = sign(unsigned, getSessionSecret());
    if (!constantTimeEqual(signature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionTokenPayload;
    if (!payload?.user?.sub || !payload?.user?.email) return null;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp <= now) return null;

    return {
      user: payload.user,
    };
  } catch {
    return null;
  }
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
    maxAge: SESSION_TTL_SECONDS,
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
