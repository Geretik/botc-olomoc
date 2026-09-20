import Link from "next/link";
import { notFound } from "next/navigation";
import { RegistrationForm } from "@/components/registration-form";
import { freeSpots } from "@/components/session-card";
import { Alert, Card } from "@/components/ui";
import { getSessionWithCount } from "@/lib/queries";
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
  const session = await getSessionWithCount(numId);
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
          {formatTime(session.startsAt)} – {formatTime(session.endsAt)}
        </p>
        <p className="text-muted">{session.place}</p>
        {session.note && (
          <p className="mt-2 text-muted whitespace-pre-line">{session.note}</p>
        )}
        <p className="mt-2 text-sm font-medium">
          {free === 0 ? "Plno" : `Volných míst: ${free} z ${session.capacity}`}
        </p>
      </div>
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
