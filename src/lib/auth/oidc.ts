import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { OidcConfig } from "@/lib/auth/config";
import type { SessionUser } from "@/lib/auth/session";

type Discovery = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  token_endpoint_auth_methods_supported?: string[];
};

const discoveryCache = new Map<string, { at: number; doc: Discovery }>();
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function randomToken(bytes = 32): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(bytes))).toString(
    "base64url"
  );
}

export function createOidcSecrets() {
  return {
    state: randomToken(),
    nonce: randomToken(),
    verifier: randomToken(),
  };
}

export async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return Buffer.from(digest).toString("base64url");
}

export async function discover(issuer: string): Promise<Discovery> {
  const cached = discoveryCache.get(issuer);
  if (cached && Date.now() - cached.at < 60 * 60 * 1000) return cached.doc;

  const res = await fetch(`${issuer}/.well-known/openid-configuration`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`OIDC discovery failed (${res.status})`);
  }
  const doc = (await res.json()) as Partial<Discovery>;
  const declared = doc.issuer?.replace(/\/+$/, "");
  if (
    !declared ||
    declared !== issuer ||
    !doc.authorization_endpoint ||
    !doc.token_endpoint ||
    !doc.jwks_uri
  ) {
    throw new Error("OIDC discovery document is incomplete");
  }
  const normalized: Discovery = {
    issuer: declared,
    authorization_endpoint: doc.authorization_endpoint,
    token_endpoint: doc.token_endpoint,
    jwks_uri: doc.jwks_uri,
    token_endpoint_auth_methods_supported:
      doc.token_endpoint_auth_methods_supported,
  };
  discoveryCache.set(issuer, { at: Date.now(), doc: normalized });
  return normalized;
}

export async function authorizationUrl(
  config: OidcConfig,
  secrets: { state: string; nonce: string; verifier: string }
): Promise<string> {
  const doc = await discover(config.issuer);
  const url = new URL(doc.authorization_endpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", config.scopes);
  url.searchParams.set("state", secrets.state);
  url.searchParams.set("nonce", secrets.nonce);
  url.searchParams.set("code_challenge", await codeChallenge(secrets.verifier));
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

function claimString(payload: JWTPayload, key: string): string {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

export async function exchangeCode(
  config: OidcConfig,
  code: string,
  verifier: string,
  nonce: string
): Promise<SessionUser> {
  const doc = await discover(config.issuer);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    code_verifier: verifier,
  });
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  });
  const methods = doc.token_endpoint_auth_methods_supported;
  const useBasic =
    Boolean(methods?.includes("client_secret_basic")) &&
    !methods?.includes("client_secret_post");
  if (useBasic) {
    const basic = Buffer.from(
      `${config.clientId}:${config.clientSecret}`,
      "utf8"
    ).toString("base64");
    headers.set("Authorization", `Basic ${basic}`);
  } else {
    body.set("client_secret", config.clientSecret);
  }

  const res = await fetch(doc.token_endpoint, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`OIDC token exchange failed (${res.status})`);
  }
  const token = (await res.json()) as { id_token?: string };
  if (!token.id_token) throw new Error("OIDC response has no id_token");

  let jwks = jwksCache.get(doc.jwks_uri);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(doc.jwks_uri));
    jwksCache.set(doc.jwks_uri, jwks);
  }
  const { payload } = await jwtVerify(token.id_token, jwks, {
    issuer: doc.issuer,
    audience: config.clientId,
  });
  if (payload.nonce !== nonce) throw new Error("OIDC nonce mismatch");
  if (payload.email_verified === false) {
    throw new Error("OIDC email is not verified");
  }

  const email = claimString(payload, "email");
  if (config.allowedEmails) {
    if (!email || !config.allowedEmails.includes(email.toLowerCase())) {
      throw new Error("OIDC email is not allowed");
    }
  }
  if (!payload.sub) throw new Error("OIDC subject is missing");

  const name =
    claimString(payload, "name") ||
    claimString(payload, "preferred_username") ||
    email ||
    "User";

  return { sub: payload.sub, email, name };
}

export function authErrorCode(err: unknown): "forbidden" | "failed" {
  if (err instanceof Error && err.message === "OIDC email is not allowed") {
    return "forbidden";
  }
  return "failed";
}
