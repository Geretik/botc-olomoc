import { SessionCard } from "@/components/session-card";
import { isAdmin } from "@/lib/admin-auth";
import { listUpcomingSessions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sessions, admin] = await Promise.all([listUpcomingSessions(), isAdmin()]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nadcházející termíny</h1>
        <p className="mt-2 text-muted">
          Vyber si termín, vyplň krátký formulář a potvrzení ti přijde na e-mail.
          Účet nepotřebuješ.
        </p>
      </div>
      {sessions.length === 0 ? (
        <p className="text-muted">Zatím nejsou vypsané žádné termíny. Zkus to později.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} admin={admin} />
          ))}
        </div>
      )}
    </div>
  );
}
