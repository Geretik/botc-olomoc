import Link from "next/link";
import { notFound } from "next/navigation";
import { EditPencil } from "@/components/edit-pencil";
import { RegistrationForm } from "@/components/registration-form";
import { ScriptLinks } from "@/components/script-links";
import { freeSpots } from "@/components/session-card";
import { Alert, Card } from "@/components/ui";
import { getDict } from "@/i18n/server";
import { isAdmin } from "@/lib/admin-auth";
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
  const [session, nicknames, admin, { locale, t }] = await Promise.all([
    getSessionWithCount(numId),
    listConfirmedNicknames(numId),
    isAdmin(),
    getDict(),
  ]);
  if (!session) notFound();

  const free = freeSpots(session);
  const past = session.endsAt < new Date();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-muted hover:underline">
        {t.session.back}
      </Link>
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          {session.title}
          {admin && <EditPencil sessionId={session.id} title={t.session.editPencil} />}
        </h1>
        <p className="mt-2">
          <span aria-hidden className="mr-1.5">📅</span>
          {formatDate(session.startsAt, locale)}, {formatTime(session.startsAt, locale)}–{formatTime(session.endsAt, locale)}
        </p>
        <p className="text-muted">
          <span aria-hidden className="mr-1.5">📍</span>
          {session.place}
        </p>
        {session.note && (
          <p className="mt-2 text-muted whitespace-pre-line">
            <span aria-hidden className="mr-1.5">📝</span>
            {session.note}
          </p>
        )}
        <ScriptLinks scripts={session.scripts} label={t.session.scripts(session.scripts.length)} className="mt-2" />
        <p className="mt-2 text-sm font-medium">
          {free === 0 ? t.session.full : t.session.freeSpotsLong(free, session.capacity)}
        </p>
      </div>
      {nicknames.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted">{t.session.registered(nicknames.length)}</h2>
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
          <Alert kind="info">{t.session.past}</Alert>
        ) : free === 0 ? (
          <Alert kind="info">{t.session.fullInfo}</Alert>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-semibold">{t.session.registrationHeading}</h2>
            <RegistrationForm
              sessionId={session.id}
              defaultArrival={formatTime(session.startsAt, locale)}
              defaultDeparture={formatTime(session.endsAt, locale)}
              t={t.form}
            />
          </>
        )}
      </Card>
    </div>
  );
}
