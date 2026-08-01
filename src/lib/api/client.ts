import type { RssFeed } from "@/lib/qb/qbittorrent";
import type { Torrent } from "@/lib/core/types";

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function joinHashes(hashes: string | string[]): string {
  return Array.isArray(hashes) ? hashes.join("|") : hashes;
}

export function fetchTorrents() {
  return api<{ torrents: Torrent[] }>("/api/qb/torrents");
}

/** Torrents + categories in one HTTP request (boot / full refresh). */
export function fetchSnapshot() {
  return api<{ torrents: Torrent[]; categories: string[] }>(
    "/api/qb/snapshot"
  );
}

export function pauseTorrent(hashes: string | string[]) {
  return api<void>("/api/qb/pause", {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes) }),
  });
}

export function resumeTorrent(hashes: string | string[]) {
  return api<void>("/api/qb/resume", {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes) }),
  });
}

export function deleteTorrent(
  hashes: string | string[],
  deleteFiles: boolean
) {
  return api<void>("/api/qb/delete", {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes), deleteFiles }),
  });
}

export function setTorrentCategory(
  hashes: string | string[],
  category: string
) {
  return api<void>("/api/qb/category", {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes), category }),
  });
}

export function addTorrentUrl(
  urls: string,
  category?: string
) {
  return api<void>("/api/qb/add", {
    method: "POST",
    body: JSON.stringify({ urls, category }),
  });
}

export function fetchRssFeeds() {
  return api<{ feeds: RssFeed[] }>("/api/qb/rss");
}

function postJson(path: string, body: Record<string, unknown>) {
  return api<void>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function addRssFeed(url: string, path?: string) {
  return postJson("/api/qb/rss/add", { url, path });
}

export function removeRssFeed(path: string) {
  return postJson("/api/qb/rss/remove", { path });
}

export function refreshRssFeed(path: string) {
  return postJson("/api/qb/rss/refresh", { path });
}

export function markRssRead(
  path: string,
  articleId?: string
) {
  return postJson("/api/qb/rss/read", { path, articleId });
}
