# 環境變數參考

範本檔與部署目錄合一，只提交 `.env.example`：

| 範本 | 複製為 | 用途 |
|------|--------|------|
| `dev/.env.example` | `.env.development.local` | 本機 `npm run dev` / Docker dev |
| `deploy/.env.example` | `deploy/.env` | Docker Compose 正式部署 |

## 必要變數

| 變數 | 說明 |
|------|------|
| `QBITTORRENT_URL` | qBittorrent Web UI 根網址；不可有尾端 `/` |
| `QBITTORRENT_USERNAME` | qBittorrent 帳號 |
| `QBITTORRENT_PASSWORD` | qBittorrent 密碼 |

Docker 正式環境由 `deploy/compose.yaml` 載入 `deploy/.env`。祕密檔不可提交 Git 或寫入 image。
