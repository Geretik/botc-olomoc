import type { Metadata } from "next";
import Link from "next/link";
import { CityBadge, CityTabs, isCity } from "@/components/city";
import { ScriptLinks } from "@/components/script-links";
import { Card } from "@/components/ui";
import { getDict } from "@/i18n/server";
import { listPastSessions } from "@/lib/queries";
import { formatDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return { title: `${t.archive.title} – ${t.meta.title}`, description: t.archive.subtitle };
}

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city: cityParam } = await searchParams;
  const city = isCity(cityParam) ? cityParam : undefined;
  const [sessions, { locale, t }] = await Promise.all([listPastSessions(city), getDict()]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.archive.title}</h1>
        <p className="mt-2 text-muted">{t.archive.subtitle}</p>
      </div>
      <CityTabs current={city} t={t} basePath="/archiv" />
      {sessions.length === 0 ? (
        <p className="text-muted">{t.archive.empty}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {sessions.map((s) => (
            <li key={s.id}>
              <Card className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">{s.title}<CityBadge city={s.city} t={t} /></h2>
                  <span className="text-sm text-muted">{t.archive.players(s.confirmedCount)}</span>
                </div>
                <p className="text-sm">
                  <span aria-hidden className="mr-1.5">📅</span>
                  {formatDate(s.startsAt, locale)}
                  <span className="text-muted"> · </span>
                  <span aria-hidden className="mr-1.5">📍</span>
                  <span className="text-muted">{s.place}</span>
                </p>
                {s.storyteller && (
                  <p className="text-sm text-muted">
                    <span aria-hidden className="mr-1.5">🎩</span>
                    {t.session.storytellerLabel}: {s.storyteller}
                  </p>
                )}
                <ScriptLinks scripts={s.scripts} label={t.session.scripts(s.scripts.length)} />
              </Card>
            </li>
          ))}
        </ol>
      )}
      <Link href="/" className="text-sm text-muted hover:underline">{t.session.back}</Link>
    </div>
  );
}
