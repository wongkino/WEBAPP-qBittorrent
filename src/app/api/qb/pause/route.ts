import { jsonOk, readHashesBody, withApi } from "@/lib/api";
import { pauseTorrents } from "@/lib/qb/qbittorrent";

export const POST = withApi(async (request) => {
  const parsed = await readHashesBody(request);
  if (parsed instanceof Response) return parsed;
  await pauseTorrents(parsed.hashes);
  return jsonOk();
});
