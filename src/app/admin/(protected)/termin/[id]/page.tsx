import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adminCancelRegistrationAction,
  adminConfirmWaitlistedAction,
  adminRestoreRegistrationAction,
  announceDiscordAction,
  deleteSessionAction,
  sendRemindersNowAction,
  updateSessionAction,
} from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AttendanceToggle } from "@/components/admin/attendance-toggle";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { DeleteSessionButton } from "@/components/admin/delete-session-button";
import { SessionForm } from "@/components/admin/session-form";
import { Button, Card } from "@/components/ui";
import type { Registration } from "@/db/schema";
import { discordConfigured } from "@/lib/discord";
import { getSessionWithCount, listRegistrationsForSession } from "@/lib/queries";
import { countPendingReminders } from "@/lib/reminders";
import { dateToPragueLocal, formatTime } from "@/lib/time";
import { editUrl } from "@/lib/site";

function Flags({ r }: { r: Registration }) {
  return (
    <>
      {r.canStorytell && <span title="Může dělat vypravěče" aria-label="Může dělat vypravěče"> 🎩</span>}
      {r.isNewbie && <span title="Nováček" aria-label="Nováček"> 🌱</span>}
    </>
  );
}

export default async function AdminSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();
  const [session, regs, pendingReminders] = await Promise.all([
    getSessionWithCount(numId),
    listRegistrationsForSession(numId),
    countPendingReminders(numId),
  ]);
  if (!session) notFound();

  const confirmed = regs.filter((r) => r.status === "confirmed");
  const waitlisted = regs
    .filter((r) => r.status === "waitlisted")
    .sort((a, b) => (a.waitlistedAt?.getTime() ?? 0) - (b.waitlistedAt?.getTime() ?? 0));
  const cancelled = regs.filter((r) => r.status === "cancelled");
  const past = session.endsAt < new Date();
  const storytellers = confirmed.filter((r) => r.canStorytell).length;
  const newbies = confirmed.filter((r) => r.isNewbie).length;
  const attended = confirmed.filter((r) => r.attended === true).length;
  const noShow = confirmed.filter((r) => r.attended === false).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{session.title}</h1>
        <DeleteSessionButton action={deleteSessionAction.bind(null, session.id)} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href={`/termin/${session.id}`} className="rounded-md border border-border bg-card px-3 py-2 hover:border-accent">
          Veřejná stránka
        </Link>
        <Link href={`/admin/novy?from=${session.id}`} className="rounded-md border border-border bg-card px-3 py-2 hover:border-accent">
          Duplikovat termín
        </Link>
        <a href={`/admin/termin/${session.id}/export.csv`} className="rounded-md border border-border bg-card px-3 py-2 hover:border-accent">
          Export CSV
        </a>
        {!past && (
          <ActionButton
            action={sendRemindersNowAction.bind(null, session.id)}
            label={`Poslat připomínku (${pendingReminders})`}
            pendingLabel="Odesílám…"
            confirmText={`Poslat připomínku ${pendingReminders} přihlášeným, kteří ji ještě nedostali? Jinak odejde automaticky den před hrou.`}
          />
        )}
        {!past && (
          <ActionButton
            action={announceDiscordAction.bind(null, session.id)}
            label="Oznámit na Discordu"
            pendingLabel="Odesílám…"
            confirmText={discordConfigured() ? "Poslat oznámení termínu na Discord?" : undefined}
          />
        )}
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Upravit termín</h2>
        <SessionForm
          action={updateSessionAction.bind(null, session.id)}
          session={session}
          mode="edit"
          defaults={{
            startsAt: dateToPragueLocal(session.startsAt),
            endsAt: dateToPragueLocal(session.endsAt),
          }}
        />
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Přihlášení ({confirmed.length} / {session.capacity})
        </h2>
        <p className="text-sm text-muted">
          🎩 vypravěči: {storytellers} · 🌱 nováčci: {newbies}
          {(attended > 0 || noShow > 0) && <> · docházka: {attended} dorazilo, {noShow} nedorazilo</>}
        </p>
        {confirmed.length === 0 && <p className="text-muted">Zatím nikdo.</p>}
        {confirmed.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-border">
                  <th className="p-3">Jméno</th>
                  <th className="p-3">Přezdívka</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3">Příchod</th>
                  <th className="p-3">Odchod</th>
                  <th className="p-3" title="Docházka">Dorazil/a</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {confirmed.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="p-3">{r.firstName} {r.lastName}</td>
                    <td className="p-3">{r.nickname}<Flags r={r} /></td>
                    <td className="p-3"><a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a></td>
                    <td className="p-3">{r.arrivalTime ?? formatTime(session.startsAt)}</td>
                    <td className="p-3">{r.departureTime ?? formatTime(session.endsAt)}</td>
                    <td className="p-3"><AttendanceToggle registrationId={r.id} attended={r.attended} /></td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <a href={editUrl(r.editToken)} className="mr-3 text-muted hover:underline" target="_blank" rel="noreferrer">odkaz</a>
                      <form action={adminCancelRegistrationAction.bind(null, r.id)} className="inline">
                        <Button type="submit" variant="danger">Odhlásit</Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {confirmed.length > 0 && (
          <p className="text-xs text-muted">
            E-maily všech: <span className="select-all">{confirmed.map((r) => r.email).join(", ")}</span>
          </p>
        )}
      </section>

      {waitlisted.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Náhradníci ({waitlisted.length})</h2>
          <p className="text-sm text-muted">
            V tomto pořadí dostanou uvolněné místo automaticky. „Potvrdit“ posune hráče mezi přihlášené i nad kapacitu.
          </p>
          <ol className="flex flex-col gap-2 text-sm">
            {waitlisted.map((r, i) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2">
                <span>
                  <span className="mr-2 font-semibold text-muted">{i + 1}.</span>
                  {r.firstName} {r.lastName} ({r.nickname}<Flags r={r} />) · {r.email}
                </span>
                <span className="flex gap-2">
                  <a href={editUrl(r.editToken)} className="self-center text-muted hover:underline" target="_blank" rel="noreferrer">odkaz</a>
                  <form action={adminConfirmWaitlistedAction.bind(null, r.id)}>
                    <Button type="submit" variant="secondary">Potvrdit</Button>
                  </form>
                  <form action={adminCancelRegistrationAction.bind(null, r.id)}>
                    <Button type="submit" variant="danger">Odhlásit</Button>
                  </form>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {cancelled.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-muted">Odhlášení ({cancelled.length})</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {cancelled.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2">
                <span className="text-muted">{r.firstName} {r.lastName} ({r.nickname}) · {r.email}</span>
                <form action={adminRestoreRegistrationAction.bind(null, r.id)}>
                  <Button type="submit" variant="secondary">Obnovit</Button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!past && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold">E-mail všem přihlášeným</h2>
          <p className="mb-4 text-sm text-muted">Např. změna místa, posun času nebo zrušení večera.</p>
          <BroadcastForm sessionId={session.id} confirmedCount={confirmed.length} waitlistedCount={waitlisted.length} />
        </Card>
      )}
    </div>
  );
}
