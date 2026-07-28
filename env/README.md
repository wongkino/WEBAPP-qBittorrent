# 環境變數範本

`.example` 檔案放此目錄；**說明文件**在 [`docs/reference/environment.md`](../docs/reference/environment.md)。

```bash
cp env/development.example .env.development.local   # npm run dev
cp env/production.example .env                       # docker compose
```

| 檔案 | 用途 |
|------|------|
| `development.example` | 本機 Next.js |
| `production.example` | Docker Compose 執行環境（勿提交真值） |
