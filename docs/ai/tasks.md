# AI 任務指引

配合 [`AGENTS.md`](../../AGENTS.md) 使用。每項任務列出**必讀檔案**與**修改順序**。

---

## 新增 qBittorrent API 功能

**必讀**：`lib/qb/qbittorrent.ts`、`lib/api/route.ts`、任一現有 `app/api/qb/*/route.ts`

```
1. lib/qb/qbittorrent.ts       新增 qB API 封裝
2. app/api/qb/<name>/route.ts  withApi
3. lib/api/client.ts           瀏覽器 fetch 函式
4. components/*                UI
5. lib/ui/i18n.ts              四語字串（zh-Hant, zh-Hans, en, ja）
```

**勿**：在 component 或 route 直接 `fetch(QBITTORRENT_URL)`。

---

## 改 UI 或文案

**必讀**：`lib/ui/i18n.ts`、目標 `components/**/*.tsx`

- 字串只加在 `lib/ui/i18n.ts` 四個 locale 區塊
- 元件用 `useI18n().t("key")`
- 新元件放 `components/`，維持現有命名風格

---

## 部署或改 CI

**必讀**：`docs/guides/deployment.md`、`deploy/Dockerfile`、`deploy/compose.yaml`

- Secrets 不提交 repo
- 容器 port 僅綁定 localhost，登入由外部反向代理負責

---

## 改環境變數

**必讀**：`docs/reference/environment.md`、`dev/.env.example`、`deploy/.env.example`

- 範本：`dev/.env.example`、`deploy/.env.example`
- 同步更新 `deploy/.env.example` 與本文件

---

## 除錯 checklist

| 現象 | 查 |
|------|-----|
| qB 502 | `QBITTORRENT_URL`、CSRF Origin/Referer、帳密 |
| 代理拒絕請求 | 代理登入規則是否同時涵蓋 `/api/qb/*` |
| lint 失敗 | `npm run lint`；避免 effect 內同步 setState |

---

## 文件維護

改架構或目錄時，同步更新：

1. `docs/architecture/codebase.md` — 目錄樹
2. `docs/reference/api-routes.md` — 若有新 route
3. `docs/reference/environment.md` — 若有新 env
4. `AGENTS.md` — 若邊界規則變了
