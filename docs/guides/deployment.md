# 部署指南（Docker）

此服務以 Docker Compose 部署。反向代理處理 HTTPS；應用程式用 Pocket ID（OIDC）登入，再用 `QBITTORRENT_USERNAME`／`QBITTORRENT_PASSWORD` 連線 qBittorrent。架構見 [overview.md](../architecture/overview.md)，環境變數見 [environment.md](../reference/environment.md)。

## 前置

- Docker Engine 與 Docker Compose plugin
- 可從 Docker 宿主機連線的 qBittorrent Web UI
- 終止 HTTPS 的反向代理
- Pocket ID 上的 OIDC 用戶端（不要勾 Public Client，要勾 PKCE）

`deploy/compose.yaml` 只發佈 `127.0.0.1:3000`，不可改成公開網卡。登入由應用程式的 OIDC session 負責。

## 上線

```bash
git clone <repo-url> qbittorrent-web-app
cd qbittorrent-web-app
cp deploy/.env.example deploy/.env
# 編輯 deploy/.env：qB URL／帳密，以及 Pocket ID 的 OIDC 與 AUTH_SECRET
docker compose -f deploy/compose.yaml up -d --build
```

在反向代理中將公開網域轉發至 `http://127.0.0.1:3000`。qB 的 `QBITTORRENT_URL` 不得有尾端 `/`。

## GitHub Packages image

推送至 `main` 或建立 `v*` tag 時，GitHub Actions 會將 image 發佈到：

```text
ghcr.io/wongkino/webapp-qbittorrent
```

部署主機可改用已發佈的 image：

```bash
docker compose -f deploy/compose.yaml pull
docker compose -f deploy/compose.yaml up -d
```

預設使用 `latest`；若要固定版本，建立 `deploy/.env` 時一併設定 `WEBAPP_IMAGE=ghcr.io/wongkino/webapp-qbittorrent:<tag>`。

## 更新與操作

```bash
git pull
docker compose -f deploy/compose.yaml pull
docker compose -f deploy/compose.yaml up -d
docker compose -f deploy/compose.yaml logs -f web
docker compose -f deploy/compose.yaml down
```

`deploy/.env` 僅留在部署主機，絕不提交或寫入 image。

## 驗證清單

- [ ] `curl http://127.0.0.1:3000` 能取得頁面
- [ ] 非 localhost 無法連線到 port 3000
- [ ] 未登入時首頁是 Pocket ID 登入，`/api/qb/snapshot` 回 401
- [ ] 用 Pocket ID 登入後可列出種子、加入 magnet／URL 並操作 RSS

## 故障排除

| 現象 | 檢查 |
|------|------|
| qB 502／登入失敗 | `QBITTORRENT_URL`、帳密、LAN 路由與 qB CSRF 設定 |
| 反向代理 502 | `docker compose -f deploy/compose.yaml ps`、`docker compose -f deploy/compose.yaml logs web`、代理 upstream 是否為 `127.0.0.1:3000` |
| API 未受保護 | 確認代理的登入規則同時涵蓋 `/api/qb/*` |
