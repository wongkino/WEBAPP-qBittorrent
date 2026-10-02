import { NextResponse } from "next/server";
import { appHome, cookieSecure, readOidcConfig } from "@/lib/auth/config";
import { authErrorCode, exchangeCode } from "@/lib/auth/oidc";
import {
  createSessionToken,
  OIDC_COOKIE,
  oidcCookieOptions,
  readOidcTransaction,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function clearOidcCookie(response: NextResponse, secure: boolean) {
  response.cookies.set(OIDC_COOKIE, "", { ...oidcCookieOptions(secure), maxAge: 0 });
}

export async function GET(request: Request) {
  const config = readOidcConfig();
  if (!config) {
    return NextResponse.redirect(new URL("/?auth_error=unconfigured", request.url));
  }

  const secure = cookieSecure(config);
  const url = new URL(request.url);
  const fail = (code: string) => {
    const response = NextResponse.redirect(appHome(config, code));
    clearOidcCookie(response, secure);
    return response;
  };

  if (url.searchParams.get("error")) return fail("denied");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return fail("failed");

  const txn = await readOidcTransaction(request, config);
  if (!txn || txn.state !== state) return fail("failed");

  try {
    const user = await exchangeCode(config, code, txn.verifier, txn.nonce);
    const response = NextResponse.redirect(appHome(config));
    response.cookies.set(
      SESSION_COOKIE,
      await createSessionToken(config, user),
      sessionCookieOptions(secure)
    );
    clearOidcCookie(response, secure);
    return response;
  } catch (err) {
    console.error(err);
    return fail(authErrorCode(err));
  }
}
