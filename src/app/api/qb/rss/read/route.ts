import { jsonOk, readRequiredString, withApi } from "@/lib/api";
import { markRssArticleRead } from "@/lib/qb/qbittorrent";

export const POST = withApi(async (request) => {
  const parsed = await readRequiredString(request, "path");
  if (parsed instanceof Response) return parsed;
  const articleId =
    typeof parsed.body.articleId === "string"
      ? parsed.body.articleId.trim() || undefined
      : undefined;
  await markRssArticleRead(parsed.value, articleId);
  return jsonOk();
});
