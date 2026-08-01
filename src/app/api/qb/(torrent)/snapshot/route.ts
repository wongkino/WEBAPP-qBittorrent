import { jsonOk, withApi } from "@/lib/api";
import { listCategories, listTorrents } from "@/lib/qb/qbittorrent";

/** Single round-trip for UI boot / manual refresh (torrents + categories). */
export const GET = withApi(async () => {
  const [torrents, categories] = await Promise.all([
    listTorrents(),
    listCategories(),
  ]);
  return jsonOk({ torrents, categories });
});
