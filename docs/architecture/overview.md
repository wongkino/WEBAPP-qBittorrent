# 架構總覽

個人 qBittorrent **Web App**（PWA／iOS 主畫面），以 Docker 執行並代理 qBittorrent Web API。瀏覽器用 Pocket ID（OIDC）登入；伺服器用 `QBITTORRENT_USERNAME`／`QBITTORRENT_PASSWORD` 的 Basic 認證連線。反向代理負責 HTTPS。

檔案目錄見 [codebase.md](codebase.md)。API 對照見 [reference/api-routes.md](../reference/api-routes.md)。

---

## 分層

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation（瀏覽器）                                      │
│  app/page.tsx → components/shell/WebApp → components/shell/QbDashboard  │
│  lib/api/client.ts                                             │
└────────────────────────────┬────────────────────────────────┘
                             │ 同源 HTTP
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  API（Next.js Route Handlers）                               │
│  app/api/qb/*/route.ts · lib/api/route.ts                           │
└────────────────────────────┬────────────────────────────────┘
                             │ Basic auth + CSRF
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  qBittorrent 代理                                            │
│  lib/qb/qbittorrent.ts → QBITTORRENT_URL                        │
└─────────────────────────────────────────────────────────────┘

Deploy：Docker Compose → Next.js standalone container
```

**技術棧**：Next.js 16 App Router、React 19、TypeScript、Docker Compose。

---

## 請求流

### 資料操作

`QbDashboard` → `lib/api/client` → `/api/qb/*` → `qbittorrent` → qBittorrent

- 多 hash 以 `|` 串接
- 下載分頁約每 4 秒輪詢（頁面隱藏時跳過）
- 開機／手動重整／加種用 `snapshot`（含 categories）

---

## 存取控制

- 主頁未登入時顯示 Pocket ID 登入。Session 為 HttpOnly cookie（約 14 天）。
- `/api/qb/*` 沒有有效 session 時回 401。qBittorrent 帳密只留在伺服器。
- Compose 僅將容器 port 發佈到 `127.0.0.1:3000`。反向代理終止 HTTPS，不要把 3000 公開到區網。

---

## 本機狀態（無伺服器 session）

| 資料 | 儲存 | 模組 |
|------|------|------|
| 語系 | `localStorage` | `lib/ui/i18n.ts` |
| 主題 | `localStorage` | `lib/theme.ts` |

---

## qBittorrent 連線

- 每個請求帶 `Authorization: Basic`，帳密來自 `QBITTORRENT_USERNAME`／`QBITTORRENT_PASSWORD`
- `Origin`／`Referer` 須符合 CSRF（`lib/qb/qbittorrent.ts`）
- Pause/Resume：先 `stop`/`start`，再 fallback `pause`/`resume`

---

## 能力邊界

| 有 | 無 |
|----|-----|
| 下載列表、排序、批次、magnet/URL | 本機 `.torrent` 上傳 |
| RSS 訂閱管理 | 內嵌網頁瀏覽 |
| 四語、日間／夜間、PWA／主畫面 | 多租戶 SaaS |

---

## 擴充入口

見 [guides/development.md](../guides/development.md) 與 [ai/tasks.md](../ai/tasks.md)。
