# API Routes 參考

`lib/api/client.ts` → `app/api/qb/*` → `lib/qb/qbittorrent.ts` → qBittorrent。

`/api/qb/*` 由 `withApi` 檢查 OIDC session，未登入回 401。

## 登入

| 用途 | HTTP |
|------|------|
| 開始 Pocket ID 登入 | `GET /api/auth/login` |
| OIDC callback | `GET /api/auth/callback` |
| 目前 session | `GET /api/auth/session` |
| 登出 | `POST /api/auth/logout` |

## 下載

| lib/api/client | HTTP |
|------------|------|
| `fetchSnapshot` | `GET /api/qb/snapshot` |
| `fetchTorrents` | `GET /api/qb/torrents` |
| `addTorrentUrl` | `POST /api/qb/add` |
| `pauseTorrent` / `resumeTorrent` | `POST /api/qb/pause` / `resume` |
| `deleteTorrent` | `POST /api/qb/delete` |
| `setTorrentCategory` | `POST /api/qb/category` |

## RSS

| lib/api/client | HTTP |
|------------|------|
| `fetchRssFeeds` | `GET /api/qb/rss` |
| `addRssFeed` / `removeRssFeed` | `POST /api/qb/rss/add` / `remove` |
| `refreshRssFeed` / `markRssRead` | `POST /api/qb/rss/refresh` / `read` |

多 hash 的 request body 使用 `|` 串接。
