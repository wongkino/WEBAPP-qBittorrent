# Production 部署

| 檔案 | 說明 |
|------|------|
| `.env.example` | 複製為 `deploy/.env` |
| `Dockerfile` | standalone 映像 |
| `compose.yaml` | Docker Compose |

```bash
cp deploy/.env.example deploy/.env
npm run prod:up
```

詳見 [`docs/guides/deployment.md`](../docs/guides/deployment.md)
