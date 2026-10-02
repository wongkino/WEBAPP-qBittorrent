import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  readAuthMode,
  readSessionSecret,
  requestIsSecure,
} from "@/lib/auth/config";
import { env } from "@/lib/core/env";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function sameSecret(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (readAuthMode() !== "password") {
    return NextResponse.json({ error: "Unavailable" }, { status: 404 });
  }
  const secret = readSessionSecret();
  const username = env("QBITTORRENT_USERNAME");
  const password = env("QBITTORRENT_PASSWORD");
  if (!secret || !username || !password) {
    return NextResponse.json({ error: "Unavailable" }, { status: 404 });
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { username?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const givenUser = typeof body.username === "string" ? body.username : "";
  const givenPassword = typeof body.password === "string" ? body.password : "";
  if (!sameSecret(givenUser, username) || !sameSecret(givenPassword, password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE,
    await createSessionToken(secret, {
      sub: "qb-password",
      email: "",
      name: username,
    }),
    sessionCookieOptions(requestIsSecure(request))
  );
  return response;
}
