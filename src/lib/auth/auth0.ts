import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const hasRequiredAuth0Config = Boolean(
  process.env.AUTH0_DOMAIN &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET &&
    process.env.AUTH0_SECRET &&
    process.env.APP_BASE_URL,
);

const auth0Client = hasRequiredAuth0Config
  ? new Auth0Client({
      authorizationParameters: {
        scope: "openid profile email",
      },
      signInReturnToPath: "/pocketDashboard",
    })
  : null;

export const isAuth0Configured = hasRequiredAuth0Config;

export const auth0 = {
  async middleware(request?: NextRequest) {
    if (!auth0Client) {
      void request;
      return NextResponse.next();
    }

    return auth0Client.middleware(request as NextRequest);
  },

  async getSession(request?: NextRequest) {
    if (!auth0Client) {
      void request;
      return null;
    }

    if (request) {
      return auth0Client.getSession(request);
    }

    return auth0Client.getSession();
  },
};
