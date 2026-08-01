import { jsonOk, readHashesBody, withApi } from "@/lib/api";
import { setTorrentCategory } from "@/lib/qb/qbittorrent";

export const POST = withApi(async (request) => {
  const parsed = await readHashesBody<{
    hashes?: string;
    category?: string;
  }>(request);
  if (parsed instanceof Response) return parsed;
  await setTorrentCategory(parsed.hashes, parsed.body.category?.trim() ?? "");
  return jsonOk();
});
