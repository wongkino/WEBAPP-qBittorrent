# 程式目錄

```
qbittorrent-web-app/
├── app/                    # Next.js App Router 與 /api/qb routes
├── components/             # React client UI
├── lib/
│   ├── api.ts              # Route 錯誤處理
│   ├── client-api.ts       # Browser → /api/qb/*
│   ├── qbittorrent.ts      # 唯一的 qB Web API 入口
│   └── i18n.ts             # 四種語系
├── public/                 # PWA 資產
├── env/*.example           # 環境範本
├── Dockerfile              # Next.js standalone image
├── compose.yaml            # 僅對 localhost 發佈 port 3000
└── docs/
```

## 關鍵檔案

| 需求 | 檔案 |
|------|------|
| 下載 UI | `components/QbDashboard.tsx` |
| API 路由 | `app/api/qb/*/route.ts` |
| qB 連線 | `lib/qbittorrent.ts` |
| 反向代理後的 API 錯誤處理 | `lib/api.ts` |
| Docker 部署 | `Dockerfile`, `compose.yaml` |
