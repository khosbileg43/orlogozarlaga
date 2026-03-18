import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type DemoSession = {
  user: {
    sub: string;
    email: string;
    name: string;
  };
};

const demoSession: DemoSession = {
  user: {
    sub: "demo-auth0-user",
    email: "demo@user.com",
    name: "Demo User",
  },
};

// Lightweight local auth shim.
// This keeps the app runnable in development when Auth0 SDK is not installed/configured.
export const auth0 = {
  async middleware(_request?: NextRequest) {
    void _request;
    return NextResponse.next();
  },

  async getSession(_request?: NextRequest): Promise<DemoSession | null> {
    void _request;
    return demoSession;
  },
};
