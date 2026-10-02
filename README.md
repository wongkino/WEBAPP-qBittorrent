# qBittorrent Web App

個人用的 qBittorrent 網頁（PWA）。瀏覽器管理下載與 RSS；伺服器代連 qBittorrent，帳號密碼不會送到瀏覽器。

反向代理只負責 HTTPS。容器只綁 `127.0.0.1:3000`，不要把這個 port 公開到區網。

## 登入

有填完整的 Pocket ID（OIDC）環境變數時，主頁用 Pocket ID 登入。

沒填 OIDC 時，主頁改用 `QBITTORRENT_USERNAME` 與 `QBITTORRENT_PASSWORD` 登入。這組帳密同時用來以 Basic 認證連線 qBittorrent。

## 功能

- 下載列表：狀態篩選、排序、批次、移除已完成（保留檔案）
- 新增 magnet 或 torrent 網址；新增按鈕可拖移，並記住位置
- RSS 訂閱，並可從文章加入下載
- 繁體中文、簡體中文、English、日本語；預設跟隨瀏覽器
- 日間／夜間
- 可加到主畫面，全螢幕使用

## 本機開發

```bash
cp dev/.env.example .env.development.local
# 編輯 .env.development.local
npm install
npm run dev
```

→ http://localhost:3000

Docker 熱更新：`npm run dev:docker`（qB 在本機時，URL 用 `http://host.docker.internal:<port>`）。

## 正式部署

```bash
cp deploy/.env.example deploy/.env
# 編輯 deploy/.env
docker compose -f deploy/compose.yaml up -d --build
```

把公開網域轉發到 `http://127.0.0.1:3000`。`QBITTORRENT_URL` 不要有尾端 `/`。

Pocket ID 用戶端不要勾 Public Client，要勾 PKCE。Callback URL 必須與 `OIDC_REDIRECT_URI` 完全一致，例如 `https://<你的網域>/api/auth/callback`。

`AUTH_SECRET` 用來簽署登入 cookie：

```bash
openssl rand -base64 32
```

沒填 OIDC 時可以不設 `AUTH_SECRET`。詳細變數見 [docs/reference/environment.md](docs/reference/environment.md)。

不要提交 `.env`、`.env.development.local` 或 `deploy/.env`。

## 文件

索引：[docs/README.md](docs/README.md)

| | |
|--|--|
| 使用者 | [docs/guides/user.md](docs/guides/user.md) |
| 開發 | [docs/guides/development.md](docs/guides/development.md) |
| 部署 | [docs/guides/deployment.md](docs/guides/deployment.md) |
| 架構 | [docs/architecture/overview.md](docs/architecture/overview.md) |
| API | [docs/reference/api-routes.md](docs/reference/api-routes.md) |
| 環境變數 | [docs/reference/environment.md](docs/reference/environment.md) |
