import { jsonOk, readRequiredString, withApi } from "@/lib/api";
import { refreshRssItem } from "@/lib/qb/qbittorrent";

export const POST = withApi(async (request) => {
  const parsed = await readRequiredString(request, "path");
  if (parsed instanceof Response) return parsed;
  await refreshRssItem(parsed.value);
  return jsonOk();
});
