import { jwtVerify, SignJWT } from "jose";
import { readOidcConfig, type OidcConfig } from "@/lib/auth/config";

export const SESSION_COOKIE = "qb-session";
export const OIDC_COOKIE = "qb-oidc";

const SESSION_MAX_AGE = 60 * 60 * 24 * 14;
const OIDC_MAX_AGE = 60 * 10;

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
};

export type OidcTransaction = {
  state: string;
  nonce: string;
  verifier: string;
};

export function cookieOptions(secure: boolean, maxAge: number) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function sessionCookieOptions(secure: boolean) {
  return cookieOptions(secure, SESSION_MAX_AGE);
}

export function oidcCookieOptions(secure: boolean) {
  return cookieOptions(secure, OIDC_MAX_AGE);
}

function secretKey(config: OidcConfig) {
  return new TextEncoder().encode(config.authSecret);
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) !== name) continue;
    try {
      return decodeURIComponent(trimmed.slice(eq + 1));
    } catch {
      return trimmed.slice(eq + 1);
    }
  }
  return null;
}

export async function createSessionToken(
  config: OidcConfig,
  user: SessionUser
): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("qb-webapp")
    .setAudience("qb-session")
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey(config));
}

export async function readSession(request: Request): Promise<SessionUser | null> {
  const config = readOidcConfig();
  if (!config) return null;
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(config), {
      issuer: "qb-webapp",
      audience: "qb-session",
    });
    if (!payload.sub) return null;
    const email = typeof payload.email === "string" ? payload.email : "";
    const name = typeof payload.name === "string" ? payload.name : "";
    return { sub: payload.sub, email, name };
  } catch {
    return null;
  }
}

export async function createOidcTransaction(
  config: OidcConfig,
  txn: OidcTransaction
): Promise<string> {
  return new SignJWT({
    nonce: txn.nonce,
    verifier: txn.verifier,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("qb-webapp")
    .setAudience("qb-oidc")
    .setSubject(txn.state)
    .setIssuedAt()
    .setExpirationTime(`${OIDC_MAX_AGE}s`)
    .sign(secretKey(config));
}

export async function readOidcTransaction(
  request: Request,
  config: OidcConfig
): Promise<OidcTransaction | null> {
  const token = readCookie(request, OIDC_COOKIE);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(config), {
      issuer: "qb-webapp",
      audience: "qb-oidc",
    });
    if (!payload.sub) return null;
    if (typeof payload.nonce !== "string" || typeof payload.verifier !== "string") {
      return null;
    }
    return {
      state: payload.sub,
      nonce: payload.nonce,
      verifier: payload.verifier,
    };
  } catch {
    return null;
  }
}
