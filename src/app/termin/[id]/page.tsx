import Link from "next/link";
import { notFound } from "next/navigation";
import { RegistrationForm } from "@/components/registration-form";
import { freeSpots } from "@/components/session-card";
import { Alert, Card } from "@/components/ui";
import { ScriptLinks } from "@/components/script-links";
import { getSessionWithCount, listConfirmedNicknames } from "@/lib/queries";
import { formatDate, formatTime } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();
  const [session, nicknames] = await Promise.all([
    getSessionWithCount(numId),
    listConfirmedNicknames(numId),
  ]);
  if (!session) notFound();

  const free = freeSpots(session);
  const past = session.endsAt < new Date();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-muted hover:underline">
        ← Zpět na termíny
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{session.title}</h1>
        <p className="mt-2">
          <span>{formatDate(session.startsAt)}</span>,{" "}
          {formatTime(session.startsAt)}–{formatTime(session.endsAt)}
        </p>
        <p className="text-muted">{session.place}</p>
        {session.note && (
          <p className="mt-2 text-muted whitespace-pre-line">{session.note}</p>
        )}
        <ScriptLinks scripts={session.scripts} className="mt-2" />
        <p className="mt-2 text-sm font-medium">
          {free === 0 ? "Plno" : `Volných míst: ${free} z ${session.capacity}`}
        </p>
      </div>
      {nicknames.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted">Přihlášení ({nicknames.length})</h2>
          <ul className="mt-1 flex flex-wrap gap-2">
            {nicknames.map((n, i) => (
              <li key={i} className="rounded-full border border-border bg-card px-3 py-1 text-sm">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Card>
        {past ? (
          <Alert kind="info">Tento termín už proběhl.</Alert>
        ) : free === 0 ? (
          <Alert kind="info">
            Termín je plný. Zkus jiný termín, nebo se podívej později, jestli se
            někdo neodhlásil.
          </Alert>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-semibold">Registrace</h2>
            <RegistrationForm
              sessionId={session.id}
              defaultArrival={formatTime(session.startsAt)}
              defaultDeparture={formatTime(session.endsAt)}
            />
          </>
        )}
      </Card>
    </div>
  );
}
