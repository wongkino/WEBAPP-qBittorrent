import { NextResponse } from "next/server";
import { appHome, cookieSecure, readOidcConfig } from "@/lib/auth/config";
import { authorizationUrl, createOidcSecrets } from "@/lib/auth/oidc";
import {
  createOidcTransaction,
  OIDC_COOKIE,
  oidcCookieOptions,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const config = readOidcConfig();
  if (!config) {
    return NextResponse.redirect(
      new URL("/?auth_error=unconfigured", request.url)
    );
  }

  try {
    const secrets = createOidcSecrets();
    const url = await authorizationUrl(config, secrets);
    const response = NextResponse.redirect(url);
    response.cookies.set(
      OIDC_COOKIE,
      await createOidcTransaction(config, secrets),
      oidcCookieOptions(cookieSecure(config))
    );
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(appHome(config, "failed"));
  }
}
