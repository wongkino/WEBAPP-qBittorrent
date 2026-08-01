# 程式目錄

完整檔案分類地圖。架構說明見 [overview.md](overview.md)。

---

## 根目錄一覽

```
qbittorrent-web-app/
├── src/                        # 應用程式原始碼（全部在此）
│   ├── app/                    # Next.js 頁面 + API
│   ├── components/             # UI 元件（依功能分子目錄）
│   └── lib/                    # 共用邏輯（api / qb / ui）
├── public/                     # 靜態資源（PWA）
├── dev/                        # 本機開發（env 範本 + Docker 熱更新）
├── deploy/                     # 正式部署（env 範本 + Docker prod）
├── docs/                       # 說明文件
├── .github/workflows/          # CI/CD
└── （根目錄設定：package.json、next.config.ts 等）
```

---

## 1. `src/` — 應用程式

### 1.1 `src/app/`

| 路徑 | 說明 |
|------|------|
| `page.tsx`、`layout.tsx`、`globals.css` | 頁面與樣式 |
| `api/qb/*/route.ts` | qB 代理 API（種子 7 + RSS 5） |

### 1.2 `src/components/`

| 子目錄 | 內容 |
|--------|------|
| `shell/` | WebApp、QbDashboard、TabBar |
| `torrent/` | 下載列表、表單、工具列 |
| `rss/` | RssPanel |
| `state/` | Loading、Empty、Offline |
| `settings/` | 主題、語系、PWA 提示 |
| `ui/` | Sheet、icons、I18nProvider |
| `boot/` | SafeArea、Theme 啟動腳本 |

### 1.3 `src/lib/`

| 子目錄 | 內容 |
|--------|------|
| `api/` | route（伺服器）、client（前端 fetch）、errors |
| `qb/` | qbittorrent.ts（唯一 qB 入口） |
| `ui/` | i18n、theme、format、pwa、safe-area |
| （根） | env.ts、types.ts |

---

## 2. 環境與部署

| 目錄 | 範本 | 祕密檔（不提交） |
|------|------|------------------|
| `dev/` | `dev/.env.example` | `.env.development.local` |
| `deploy/` | `deploy/.env.example` | `deploy/.env` |

| 指令 | 說明 |
|------|------|
| `npm run dev` | 宿主機熱更新 |
| `npm run dev:docker` | Docker 熱更新 |
| `npm run prod:up` | 正式部署 |

---

## 3. 分層對照

```
src/components/*  →  src/lib/api/client  →  src/app/api/qb/*  →  src/lib/qb/qbittorrent  →  qB
```

| 需求 | 入口 |
|------|------|
| 下載 UI | `src/components/shell/QbDashboard.tsx` |
| API 路由 | `src/app/api/qb/*/route.ts` |
| qB 連線 | `src/lib/qb/qbittorrent.ts` |
| Docker 部署 | `deploy/` |

---

## 4. 其他

| 目錄 | 說明 |
|------|------|
| `docs/` | 架構、指南、參考、AI 任務 |
| `.github/workflows/` | GHCR 建置、k3s manifest |
| `.cursor/rules/` | Cursor AI 規則 |

建置產物（不提交）：`node_modules/`、`.next/`、`*.tsbuildinfo`
