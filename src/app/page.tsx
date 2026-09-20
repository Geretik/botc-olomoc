import { SessionCard } from "@/components/session-card";
import { getDict } from "@/i18n/server";
import { isAdmin } from "@/lib/admin-auth";
import { listUpcomingSessions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sessions, admin, { locale, t }] = await Promise.all([
    listUpcomingSessions(),
    isAdmin(),
    getDict(),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.home.title}</h1>
        <p className="mt-2 text-muted">{t.home.intro}</p>
      </div>
      {sessions.length === 0 ? (
        <p className="text-muted">{t.home.empty}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} admin={admin} locale={locale} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
