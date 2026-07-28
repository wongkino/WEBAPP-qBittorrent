import { jsonOk, withApi } from "@/lib/api";
import { listTorrents } from "@/lib/qbittorrent";

export const GET = withApi(async () =>
  jsonOk({ torrents: await listTorrents() })
);
