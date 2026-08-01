import { jsonOk, readHashesBody, withApi } from "@/lib/api";
import { resumeTorrents } from "@/lib/qb/qbittorrent";

export const POST = withApi(async (request) => {
  const parsed = await readHashesBody(request);
  if (parsed instanceof Response) return parsed;
  await resumeTorrents(parsed.hashes);
  return jsonOk();
});
