import { env } from "@/lib/core/env";

export type OidcConfig = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
  authSecret: string;
  allowedEmails: string[] | null;
};

/** Pocket ID（或其他 OIDC）設定。缺任一必要值時視為未啟用。 */
export function readOidcConfig(): OidcConfig | null {
  const issuer = env("OIDC_ISSUER")?.replace(/\/+$/, "");
  const clientId = env("OIDC_CLIENT_ID");
  const clientSecret = env("OIDC_CLIENT_SECRET");
  const redirectUri = env("OIDC_REDIRECT_URI");
  const authSecret = env("AUTH_SECRET");
  if (!issuer || !clientId || !clientSecret || !redirectUri || !authSecret) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(redirectUri);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  const allowedRaw = env("OIDC_ALLOWED_EMAILS");
  const allowedEmails = allowedRaw
    ? allowedRaw
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    : null;

  return {
    issuer,
    clientId,
    clientSecret,
    redirectUri,
    scopes: env("OIDC_SCOPES") ?? "openid profile email",
    authSecret,
    allowedEmails: allowedEmails && allowedEmails.length > 0 ? allowedEmails : null,
  };
}

export function cookieSecure(config: OidcConfig): boolean {
  return new URL(config.redirectUri).protocol === "https:";
}

/** 登入完成後回到公開網址的首頁，不使用反向代理後面的內部位址。 */
export function appHome(config: OidcConfig, authError?: string): URL {
  const url = new URL("/", config.redirectUri);
  if (authError) url.searchParams.set("auth_error", authError);
  return url;
}
