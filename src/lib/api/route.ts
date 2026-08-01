import { NextResponse } from "next/server";
import { QBitError } from "@/lib/qb/qbittorrent";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk(data: Record<string, unknown> = { ok: true }) {
  return NextResponse.json(data);
}

/** Shared error-handling shell for `/api/qb/*`.
 * Access control is enforced by the external reverse proxy.
 */
export function withApi(
  handler: (request: Request) => Promise<Response> | Response
) {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

/** Parse JSON body and require a non-empty `hashes` field. */
export async function readHashesBody<T extends { hashes?: string }>(
  request: Request
): Promise<{ hashes: string; body: T } | Response> {
  const body = (await request.json()) as T;
  const hashes = body.hashes?.trim();
  if (!hashes) return jsonError("hashes is required", 400);
  return { hashes, body };
}

/** Parse JSON body and require a non-empty string field. */
export async function readRequiredString(
  request: Request,
  key: string
): Promise<{ value: string; body: Record<string, unknown> } | Response> {
  const body = (await request.json()) as Record<string, unknown>;
  const raw = body[key];
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return jsonError(`${key} is required`, 400);
  return { value, body };
}

function handleApiError(err: unknown) {
  if (err instanceof QBitError) {
    return jsonError(err.message, err.status);
  }
  console.error(err);
  return jsonError("Internal server error", 500);
}
