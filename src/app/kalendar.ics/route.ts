import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { isCity } from "@/components/city";
import { dictionaries } from "@/i18n/dictionaries";
import { buildIcs } from "@/lib/ics";
import { siteName } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Public iCal feed: all sessions from the last 90 days onwards, optionally for one city (?city=praha). */
export async function GET(req: Request) {
  const cityParam = new URL(req.url).searchParams.get("city");
  const city = isCity(cityParam) ? cityParam : undefined;
  const since = new Date(Date.now() - 90 * 864e5);
  const list = await db.query.sessions.findMany({
    where: and(gte(sessions.endsAt, since), city ? eq(sessions.city, city) : undefined),
    orderBy: (s, { asc }) => [asc(s.startsAt)],
  });
  const name = city ? `${siteName()} – ${dictionaries.cs.city[city]}` : siteName();
  return new Response(buildIcs(list, name), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "cache-control": "public, max-age=900",
    },
  });
}
