import { jsonOk, withApi } from "@/lib/api";
import { listTorrents } from "@/lib/qb/qbittorrent";

export const GET = withApi(async () =>
  jsonOk({ torrents: await listTorrents() })
);
