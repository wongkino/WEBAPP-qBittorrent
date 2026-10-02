import { NextResponse } from "next/server";
import { readOidcConfig } from "@/lib/auth/config";
import { readSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const config = readOidcConfig();
  if (!config) {
    return NextResponse.json({ configured: false, user: null });
  }
  const user = await readSession(request);
  return NextResponse.json({
    configured: true,
    user: user ? { name: user.name, email: user.email } : null,
  });
}
