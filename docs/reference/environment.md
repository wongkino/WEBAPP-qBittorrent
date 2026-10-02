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
| `QBITTORRENT_USERNAME` | 連線 qBittorrent 的 Basic 認證帳號 |
| `QBITTORRENT_PASSWORD` | 連線 qBittorrent 的 Basic 認證密碼。不會送到瀏覽器 |

## Pocket ID（OIDC）

主頁登入用 OIDC。未設定時只顯示設定提示，`/api/qb/*` 回 401。

| 變數 | 說明 |
|------|------|
| `OIDC_ISSUER` | Pocket ID 網址，與 discovery 的 `issuer` 相同，不可有尾端 `/` |
| `OIDC_CLIENT_ID` | Pocket ID OIDC 用戶端 ID |
| `OIDC_CLIENT_SECRET` | 用戶端密鑰 |
| `OIDC_REDIRECT_URI` | 必須是 `https://<你的網域>/api/auth/callback`（本機可用 `http://localhost:3000/api/auth/callback`） |
| `AUTH_SECRET` | 簽署 session cookie。`openssl rand -base64 32` |
| `OIDC_ALLOWED_EMAILS` | 選填。逗號分隔；留空則接受該用戶端登入成功的任何人 |
| `OIDC_SCOPES` | 選填。預設 `openid profile email` |

Pocket ID 用戶端：不要勾 Public Client，要勾 PKCE。Callback URL 與 `OIDC_REDIRECT_URI` 完全一致。

Docker 正式環境由 `deploy/compose.yaml` 載入 `deploy/.env`。祕密檔不可提交 Git 或寫入 image。
