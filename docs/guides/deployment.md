# 部署指南（Docker）

此服務以 Docker Compose 部署，並由既有反向代理處理 HTTPS 與登入。架構見 [overview.md](../architecture/overview.md)，環境變數見 [environment.md](../reference/environment.md)。

## 前置

- Docker Engine 與 Docker Compose plugin
- 可從 Docker 宿主機連線的 qBittorrent Web UI
- 已設定登入保護的既有反向代理

反向代理必須保護 `/` 和所有 `/api/qb/*`。`compose.yaml` 只發佈 `127.0.0.1:3000`，不可改成公開網卡。

## 上線

```bash
git clone <repo-url> qbittorrent-web-app
cd qbittorrent-web-app
cp env/production.example .env
# 編輯 .env，填入區網 qB URL、帳號與密碼
docker compose up -d --build
```

在反向代理中將公開網域轉發至 `http://127.0.0.1:3000`。qB 的 `QBITTORRENT_URL` 不得有尾端 `/`。

## GitHub Packages image

推送至 `main` 或建立 `v*` tag 時，GitHub Actions 會將 image 發佈到：

```text
ghcr.io/wongkino/webapp-qbittorrent
```

部署主機可改用已發佈的 image：

```bash
docker compose pull
docker compose up -d
```

預設使用 `latest`；若要固定版本，建立 `.env` 時一併設定 `WEBAPP_IMAGE=ghcr.io/wongkino/webapp-qbittorrent:<tag>`。

## 更新與操作

```bash
git pull
docker compose pull
docker compose up -d
docker compose logs -f web
docker compose down
```

`.env` 僅留在宿主機，絕不提交或寫入 image。

## 驗證清單

- [ ] `curl http://127.0.0.1:3000` 能取得頁面
- [ ] 非 localhost 無法連線到 port 3000
- [ ] 未登入反向代理時，`/` 與 `/api/qb/snapshot` 均被拒絕
- [ ] 登入後可列出種子、加入 magnet／URL 並操作 RSS

## 故障排除

| 現象 | 檢查 |
|------|------|
| qB 502／登入失敗 | `QBITTORRENT_URL`、帳密、LAN 路由與 qB CSRF 設定 |
| 反向代理 502 | `docker compose ps`、`docker compose logs web`、代理 upstream 是否為 `127.0.0.1:3000` |
| API 未受保護 | 確認代理的登入規則同時涵蓋 `/api/qb/*` |
