import type { NextRequest } from "next/server";
import {
  buildAllEntries,
  fetchPublicMenuSlugs,
  getSiteOrigin,
  todayIsoDate,
} from "@/lib/sitemap/data";
import { xmlResponse } from "@/lib/sitemap/response";
import { buildUrlset } from "@/lib/sitemap/xml";

export const dynamic = "force-dynamic";

/** Full urlset (main + all menus). Kept for existing GSC submissions. */
export async function GET(request: NextRequest) {
  const siteOrigin = getSiteOrigin(request.nextUrl.origin);
  const lastmod = todayIsoDate();
  const slugs = await fetchPublicMenuSlugs();
  const xml = buildUrlset(buildAllEntries(siteOrigin, slugs, lastmod));
  return xmlResponse(xml);
}
