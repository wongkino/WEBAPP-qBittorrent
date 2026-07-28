import { jsonOk, withApi } from "@/lib/api";
import { listRssFeeds } from "@/lib/qbittorrent";

export const GET = withApi(async () =>
  jsonOk({ feeds: await listRssFeeds() })
);
