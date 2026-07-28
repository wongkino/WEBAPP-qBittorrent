# 架構總覽

個人 qBittorrent **Web App**（PWA／iOS 主畫面），以 Docker 執行並代理 qBittorrent Web API。外部反向代理負責 HTTPS 與登入。

檔案目錄見 [codebase.md](codebase.md)。API 對照見 [reference/api-routes.md](../reference/api-routes.md)。

---

## 分層

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation（瀏覽器）                                      │
│  app/page.tsx → components/WebApp → components/QbDashboard  │
│  lib/client-api.ts                                             │
└────────────────────────────┬────────────────────────────────┘
                             │ 同源 HTTP
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  API（Next.js Route Handlers）                               │
│  app/api/qb/*/route.ts · lib/api.ts                           │
└────────────────────────────┬────────────────────────────────┘
                             │ Session + CSRF
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  qBittorrent 代理                                            │
│  lib/qbittorrent.ts → QBITTORRENT_URL                        │
└─────────────────────────────────────────────────────────────┘

Deploy：Docker Compose → Next.js standalone container
```

**技術棧**：Next.js 16 App Router、React 19、TypeScript、Docker Compose。

---

## 請求流

### 資料操作

`QbDashboard` → `client-api` → `/api/qb/*` → `qbittorrent` → qBittorrent

- 多 hash 以 `|` 串接
- 下載分頁約每 4 秒輪詢（頁面隱藏時跳過）
- 開機／手動重整／加種用 `snapshot`（含 categories）

---

## 存取控制

- Web App 不處理登入或使用者 session；既有反向代理必須保護 `/` 與所有 `/api/qb/*`。
- Compose 僅將容器 port 發佈到 `127.0.0.1:3000`，避免從區網直接存取。

---

## 本機狀態（無伺服器 session）

| 資料 | 儲存 | 模組 |
|------|------|------|
| 語系 | `localStorage` | `lib/i18n.ts` |
| 主題 | `localStorage` | `lib/theme.ts` |

---

## qBittorrent 連線

- `Origin`／`Referer` 須符合 CSRF（`lib/qbittorrent.ts`）
- Form login 不帶 Basic Auth；之後帶 SID
- Session 快取約 55 分鐘
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
