# 本機開發

| 檔案 | 說明 |
|------|------|
| `.env.example` | 複製為根目錄 `.env.development.local` |
| `docker/` | Docker 熱更新（`npm run dev:docker`） |

```bash
cp dev/.env.example .env.development.local
npm run dev              # 宿主機
npm run dev:docker       # Docker
```

詳見 [`docs/guides/development.md`](../docs/guides/development.md)
