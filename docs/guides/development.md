# 開發指南

```bash
cp env/development.example .env.development.local
npm ci
npm run dev
```

本機開發會連線至設定的 qBittorrent Web UI；沒有假資料或應用程式登入模式。

## Scripts

| 指令 | 說明 |
|------|------|
| `npm run dev:env` | 複製開發環境範本 |
| `npm run dev` | Next.js 開發伺服器 |
| `npm run build` / `npm run start` | Production build / 執行 |
| `npm run lint` | ESLint |

## 新增 qBittorrent 功能

`lib/qbittorrent.ts` → `app/api/qb/<name>/route.ts`（`withApi`）→ `lib/client-api.ts` → `components/*` → `lib/i18n.ts`

- qB 只可經 `lib/qbittorrent.ts` 存取。
- `/api/qb/*` 的存取控制由反向代理提供。
- UI 字串需補齊四種語系。
