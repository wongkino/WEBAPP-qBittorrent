import { NextResponse } from "next/server";
import { cookieSecure, readOidcConfig } from "@/lib/auth/config";
import {
  OIDC_COOKIE,
  oidcCookieOptions,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const config = readOidcConfig();
  const secure = config ? cookieSecure(config) : false;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(secure),
    maxAge: 0,
  });
  response.cookies.set(OIDC_COOKIE, "", {
    ...oidcCookieOptions(secure),
    maxAge: 0,
  });
  return response;
}
