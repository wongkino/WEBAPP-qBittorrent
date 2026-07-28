# qBittorrent Web App

個人 Web App（PWA），以 Docker 部署並代理 qBittorrent；既有反向代理負責登入。

```bash
cp env/development.example .env.development.local
npm install && npm run dev

# 正式 Docker 部署
cp env/production.example .env
docker compose up -d --build
```

→ http://localhost:3000

---

## 文件

**索引**：[`docs/README.md`](docs/README.md) · **AI**：[AGENTS.md](AGENTS.md)

| | |
|--|--|
| 使用者 | [docs/guides/user.md](docs/guides/user.md) |
| 開發 | [docs/guides/development.md](docs/guides/development.md) |
| 部署 | [docs/guides/deployment.md](docs/guides/deployment.md) |
| 架構 | [docs/architecture/overview.md](docs/architecture/overview.md) |
| API | [docs/reference/api-routes.md](docs/reference/api-routes.md) |
| 環境變數 | [docs/reference/environment.md](docs/reference/environment.md) |

範本檔：`env/*.example`

---

## 功能

反向代理登入 · 下載管理 · RSS · 四語 · 日間／夜間 · PWA
