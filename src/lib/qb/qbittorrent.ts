import { env } from "@/lib/core/env";
import type { Torrent } from "@/lib/core/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function getConfig() {
  const baseUrl = env("QBITTORRENT_URL")?.replace(/\/+$/, "");
  const username = env("QBITTORRENT_USERNAME");
  const password = env("QBITTORRENT_PASSWORD");
  if (!baseUrl || !username || !password) {
    throw new QBitError("qBittorrent is not configured", 500);
  }
  return { baseUrl, username, password };
}

function basicAuthHeader(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
}

/** Strip default ports — qBittorrent CSRF compares Origin strictly. */
function requestOrigin(baseUrl: string): string {
  const url = new URL(baseUrl);
  if (
    (url.protocol === "https:" && url.port === "443") ||
    (url.protocol === "http:" && url.port === "80")
  ) {
    url.port = "";
  }
  return url.origin;
}

function qbHeaders(baseUrl: string, extra?: HeadersInit): Headers {
  const { username, password } = getConfig();
  const origin = requestOrigin(baseUrl);
  const headers = new Headers(extra);
  headers.set("Referer", `${origin}/`);
  headers.set("Origin", origin);
  headers.set("Authorization", basicAuthHeader(username, password));
  headers.set("User-Agent", USER_AGENT);
  headers.set("Accept", "text/plain, */*");
  return headers;
}

async function qbFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { baseUrl } = getConfig();
  const headers = qbHeaders(baseUrl, init.headers);
  if (init.body instanceof FormData) {
    headers.delete("Content-Type");
  }

  try {
    return await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "network error";
    throw new QBitError(`Failed to reach qBittorrent (${detail})`, 502);
  }
}

async function postForm(
  path: string,
  fields: Record<string, string>
): Promise<void> {
  const res = await qbFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new QBitError(
      `qBittorrent request failed (${res.status})${text ? `: ${text.slice(0, 120)}` : ""}`,
      502
    );
  }
}

/** Prefer v5 stop/start; fall back to v4 pause/resume. */
async function postWithFallback(
  primary: string,
  fallback: string,
  fields: Record<string, string>
): Promise<void> {
  try {
    await postForm(primary, fields);
  } catch (err) {
    try {
      await postForm(fallback, fields);
    } catch {
      throw err;
    }
  }
}

type RawTorrent = Record<string, unknown>;

function projectTorrent(raw: RawTorrent): Torrent {
  return {
    hash: String(raw.hash ?? ""),
    name: String(raw.name ?? ""),
    size: Number(raw.size) || 0,
    progress: Number(raw.progress) || 0,
    dlspeed: Number(raw.dlspeed) || 0,
    upspeed: Number(raw.upspeed) || 0,
    state: String(raw.state ?? "unknown"),
    eta: Number(raw.eta) || 0,
    category: String(raw.category ?? ""),
    added_on: Number(raw.added_on) || 0,
  };
}

async function fetchRawTorrents(): Promise<RawTorrent[]> {
  const res = await qbFetch("/api/v2/torrents/info", { method: "GET" });
  if (!res.ok) throw new QBitError("Failed to fetch torrents", 502);
  return (await res.json()) as RawTorrent[];
}

export async function listTorrents(): Promise<Torrent[]> {
  return (await fetchRawTorrents()).map(projectTorrent);
}

export async function listCategories(): Promise<string[]> {
  const res = await qbFetch("/api/v2/torrents/categories", { method: "GET" });
  if (!res.ok) throw new QBitError("Failed to fetch categories", 502);
  const raw = (await res.json()) as Record<string, unknown>;
  return Object.keys(raw).sort((a, b) => a.localeCompare(b, "zh-Hant"));
}

export async function pauseTorrents(hashes: string): Promise<void> {
  await postWithFallback("/api/v2/torrents/stop", "/api/v2/torrents/pause", {
    hashes,
  });
}

export async function resumeTorrents(hashes: string): Promise<void> {
  await postWithFallback("/api/v2/torrents/start", "/api/v2/torrents/resume", {
    hashes,
  });
}

export async function deleteTorrents(
  hashes: string,
  deleteFiles: boolean
): Promise<void> {
  await postForm("/api/v2/torrents/delete", {
    hashes,
    deleteFiles: deleteFiles ? "true" : "false",
  });
}

export async function setTorrentCategory(
  hashes: string,
  category: string
): Promise<void> {
  await postForm("/api/v2/torrents/setCategory", { hashes, category });
}

export async function addTorrent(
  urls: string,
  category?: string
): Promise<void> {
  const fields: Record<string, string> = { urls };
  if (category) fields.category = category;
  await postForm("/api/v2/torrents/add", fields);
}

export type RssArticle = {
  id: string;
  title: string;
  torrentUrl: string;
  link: string;
  date: string;
  isRead: boolean;
};

export type RssFeed = {
  path: string;
  url: string;
  title: string;
  isLoading: boolean;
  hasError: boolean;
  articles: RssArticle[];
};

function isRssFeedNode(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.url === "string" || Array.isArray(obj.articles);
}

function projectArticle(raw: Record<string, unknown>): RssArticle {
  const torrentUrl =
    String(raw.torrentURL ?? raw.torrentUrl ?? raw.link ?? "").trim() ||
    String(raw.link ?? "").trim();
  return {
    id: String(raw.id ?? raw.guid ?? raw.title ?? ""),
    title: String(raw.title ?? "未命名"),
    torrentUrl,
    link: String(raw.link ?? ""),
    date: String(raw.date ?? raw.pubDate ?? ""),
    isRead: Boolean(raw.isRead),
  };
}

function flattenRssItems(
  node: unknown,
  parentPath = ""
): RssFeed[] {
  if (!node || typeof node !== "object") return [];
  const feeds: RssFeed[] = [];

  for (const [name, value] of Object.entries(node as Record<string, unknown>)) {
    const path = parentPath ? `${parentPath}\\${name}` : name;

    if (typeof value === "string") {
      feeds.push({
        path,
        url: value,
        title: name,
        isLoading: false,
        hasError: false,
        articles: [],
      });
      continue;
    }

    if (isRssFeedNode(value)) {
      const articlesRaw = Array.isArray(value.articles) ? value.articles : [];
      feeds.push({
        path,
        url: String(value.url ?? ""),
        title: String(value.title ?? name),
        isLoading: Boolean(value.isLoading),
        hasError: Boolean(value.hasError),
        articles: articlesRaw
          .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
          .map(projectArticle),
      });
      continue;
    }

    if (value && typeof value === "object") {
      feeds.push(...flattenRssItems(value, path));
    }
  }

  return feeds;
}

export async function listRssFeeds(): Promise<RssFeed[]> {
  const res = await qbFetch("/api/v2/rss/items?withData=true", { method: "GET" });
  if (!res.ok) throw new QBitError("Failed to fetch RSS items", 502);
  const raw = (await res.json()) as Record<string, unknown>;
  return flattenRssItems(raw).sort((a, b) =>
    a.path.localeCompare(b.path, "zh-Hant")
  );
}

export async function addRssFeed(url: string, path?: string): Promise<void> {
  const fields: Record<string, string> = { url };
  if (path?.trim()) fields.path = path.trim();
  await postForm("/api/v2/rss/addFeed", fields);
}

export async function removeRssItem(path: string): Promise<void> {
  await postForm("/api/v2/rss/removeItem", { path });
}

export async function refreshRssItem(itemPath: string): Promise<void> {
  await postForm("/api/v2/rss/refreshItem", { itemPath });
}

export async function markRssArticleRead(
  itemPath: string,
  articleId?: string
): Promise<void> {
  const fields: Record<string, string> = { itemPath };
  if (articleId) fields.articleId = articleId;
  await postForm("/api/v2/rss/markAsRead", fields);
}

export class QBitError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "QBitError";
    this.status = status;
  }
}
