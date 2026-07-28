# 環境變數參考

範本檔位於 [`env/`](../../env/)，只提交 `.example` 檔案。

| 檔案 | 用途 |
|------|------|
| `env/development.example` | 複製為 `.env.development.local`，供 `npm run dev` 使用 |
| `env/production.example` | 複製為 `.env`，供 Docker Compose 使用 |

## 必要變數

| 變數 | 說明 |
|------|------|
| `QBITTORRENT_URL` | qBittorrent Web UI 根網址；不可有尾端 `/` |
| `QBITTORRENT_USERNAME` | qBittorrent 帳號 |
| `QBITTORRENT_PASSWORD` | qBittorrent 密碼 |

Docker 執行時由 Compose 的 `.env` 載入這些值。`.env` 是祕密檔案，僅留在部署主機、不可提交 Git 或寫入 Docker image。
