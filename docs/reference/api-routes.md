# API Routes 參考

`lib/api/client.ts` → `app/api/qb/*` → `lib/qb/qbittorrent.ts` → qBittorrent。

所有 `/api/qb/*` 由既有反向代理保護；route 透過 `withApi` 統一處理錯誤。

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
