# 開發指南

```bash
cp dev/.env.example .env.development.local
npm ci
npm run dev
```

### Docker 開發（熱更新）

```bash
cp dev/.env.example .env.development.local
npm run dev:docker
```

- qB 在本機宿主：URL 用 `http://host.docker.internal:<port>`
- 停止：`npm run dev:docker:down`

## Scripts

| 指令 | 說明 |
|------|------|
| `npm run dev:env` | 複製 `dev/.env.example` |
| `npm run dev` | 宿主機 Next.js 熱更新 |
| `npm run dev:docker` | Docker 熱更新 |
| `npm run dev:docker:down` | 停止 Docker dev |
| `npm run build` / `npm run start` | Production build / 執行 |
| `npm run prod:env` | 複製 `deploy/.env.example` → `deploy/.env` |
| `npm run prod:up` | Docker 正式部署 |
| `npm run lint` | ESLint |

## 新增 qBittorrent 功能

`src/lib/qb/qbittorrent.ts` → `src/app/api/qb/<name>/route.ts`（`withApi`）→ `src/lib/api/client.ts` → `src/components/*` → `src/lib/ui/i18n.ts`

- qB 只可經 `lib/qb/qbittorrent.ts` 存取（import 路徑 `@/lib/qb/qbittorrent`）
- UI 字串需補齊四種語系
