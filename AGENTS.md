# AGENTS.md — AI / Cursor 開發指引

> **文件地圖**：[`docs/README.md`](docs/README.md) · **任務步驟**：[`docs/ai/tasks.md`](docs/ai/tasks.md)

## 專案

個人 **qBittorrent Web App**（PWA），以 Docker 執行並代理 qBittorrent；外部反向代理負責登入。

- 部署：Docker Compose；Web App 僅綁定宿主機 localhost
- 語系：四語，`localStorage`（`lib/ui/i18n.ts`）
- 白名單個人工具；勿做成 SaaS

## 分層（必記）

```
components/* → lib/api/client.ts → app/api/qb/* → lib/qb/qbittorrent.ts → qB
```

| 層 | 路徑 | 規則 |
|----|------|------|
| UI | `components/` | client only；字串 → `lib/ui/i18n.ts` |
| 前端 API | `lib/api/client.ts` | 只打 `/api/qb/*` |
| Route | `app/api/qb/*/route.ts` | `withApi` 錯誤處理 |
| qB | `lib/qb/qbittorrent.ts` | **唯一**打 qBittorrent |

## 閱讀順序

1. [`docs/architecture/overview.md`](docs/architecture/overview.md)
2. [`docs/architecture/codebase.md`](docs/architecture/codebase.md)
3. [`docs/reference/api-routes.md`](docs/reference/api-routes.md)
4. [`docs/reference/environment.md`](docs/reference/environment.md)
5. [`docs/ai/tasks.md`](docs/ai/tasks.md) — 依任務查步驟

## 硬規則

- `/api/qb/*` 由既有反向代理保護；不可直接公開容器 port 3000
- qB CSRF：`Origin`/`Referer` 正確；pause 先 `stop` 再 `pause`
- 不提交 `.env*`、`deploy/.env`
- 回覆使用者用**繁體中文**
- 新功能：`lib/qb/qbittorrent.ts` → route → `lib/api/client.ts` → component + `lib/ui/i18n.ts`（四語）

## 部署

[`docs/guides/deployment.md`](docs/guides/deployment.md) · `deploy/.env.example` · `deploy/`
