import { NextResponse } from "next/server";
import { readAuthMode } from "@/lib/auth/config";
import { readSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const mode = readAuthMode();
  if (mode === "setup") {
    return NextResponse.json({ mode, user: null });
  }
  const user = await readSession(request);
  return NextResponse.json({
    mode,
    user: user ? { name: user.name, email: user.email } : null,
  });
}
