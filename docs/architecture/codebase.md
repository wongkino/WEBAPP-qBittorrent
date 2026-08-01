# 程式目錄

完整檔案分類地圖。架構說明見 [overview.md](overview.md)。

---

## 根目錄

```
qbittorrent-web-app/
├── src/                        # 應用程式原始碼
│   ├── app/                    # Next.js 頁面 + API
│   ├── components/             # UI（shell / torrent / rss / …）
│   └── lib/                    # 邏輯（api / qb / ui / core）
├── public/                     # PWA 靜態資源
├── dev/                        # 本機開發（.env.example + docker/）
├── deploy/                     # 正式部署（.env.example + Docker）
├── config/                     # 工具設定（eslint）
├── docs/                       # 說明文件
├── .github/workflows/          # CI/CD
└── 根目錄設定檔                 # package.json、next.config.ts、tsconfig.json
```

> 根目錄設定檔為 npm / Next.js / TypeScript 硬性要求，不可移入子目錄。  
> `eslint.config.mjs` 為 re-export，實體在 `config/`。

---

## 1. `src/app/`

| 路徑 | 說明 |
|------|------|
| `page.tsx`、`layout.tsx`、`globals.css` | 頁面與樣式 |
| `api/qb/(torrent)/*/route.ts` | 種子 API（7 個；`(torrent)` 僅分組，不影響 URL） |
| `api/qb/rss/*/route.ts` | RSS API（5 個） |

---

## 2. `src/components/`

| 子目錄 | 內容 |
|--------|------|
| `shell/` | WebApp、QbDashboard、TabBar |
| `torrent/` | 下載列表、表單、工具列、分類 |
| `rss/` | RssPanel |
| `state/` | Loading、Empty、Offline |
| `settings/` | 主題、語系、PWA 提示 |
| `ui/` | Sheet、icons、I18nProvider |
| `boot/` | SafeArea、Theme 啟動腳本 |

---

## 3. `src/lib/`

| 子目錄 | 內容 |
|--------|------|
| `api/` | `route.ts`（伺服器）、`client.ts`（前端）、`errors.ts` |
| `qb/` | `qbittorrent.ts`（唯一 qB 入口） |
| `ui/` | i18n、theme、format、pwa、safe-area |
| `core/` | env.ts、types.ts |

---

## 4. 環境與部署

| 目錄 | 範本 | 祕密（不提交） |
|------|------|----------------|
| `dev/` | `dev/.env.example` | `.env.development.local` |
| `deploy/` | `deploy/.env.example` | `deploy/.env` |

| 指令 | 說明 |
|------|------|
| `npm run dev` | 宿主機熱更新 |
| `npm run dev:docker` | Docker 熱更新 |
| `npm run prod:up` | 正式部署 |

---

## 5. 分層

```
src/components/*  →  src/lib/api/client  →  src/app/api/qb/*  →  src/lib/qb/qbittorrent  →  qB
```

| 需求 | 路徑 |
|------|------|
| 下載 UI | `src/components/shell/QbDashboard.tsx` |
| 前端 API | `src/lib/api/client.ts` |
| Route | `src/app/api/qb/**/route.ts` |
| qB 連線 | `src/lib/qb/qbittorrent.ts` |
| 型別 | `src/lib/core/types.ts` |

---

## 6. 其他

| 路徑 | 說明 |
|------|------|
| `docs/` | 架構、指南、參考、AI 任務 |
| `config/eslint.config.mjs` | ESLint 規則 |
| `.github/workflows/` | GHCR、k3s manifest |
| `.cursor/rules/` | Cursor AI 規則 |

不提交：`node_modules/`、`.next/`、`*.tsbuildinfo`、`next-env.d.ts`
