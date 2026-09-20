import { notFound } from "next/navigation";
import {
  adminCancelRegistrationAction,
  adminRestoreRegistrationAction,
  deleteSessionAction,
  updateSessionAction,
} from "@/app/actions/admin";
import { DeleteSessionButton } from "@/components/admin/delete-session-button";
import { SessionForm } from "@/components/admin/session-form";
import { Button, Card } from "@/components/ui";
import { getSessionWithCount, listRegistrationsForSession } from "@/lib/queries";
import { dateToPragueLocal, formatTime } from "@/lib/time";
import { editUrl } from "@/lib/site";

export default async function AdminSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();
  const [session, regs] = await Promise.all([
    getSessionWithCount(numId),
    listRegistrationsForSession(numId),
  ]);
  if (!session) notFound();

  const confirmed = regs.filter((r) => r.status === "confirmed");
  const cancelled = regs.filter((r) => r.status === "cancelled");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{session.title}</h1>
        <DeleteSessionButton action={deleteSessionAction.bind(null, session.id)} />
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Upravit termín</h2>
        <SessionForm
          action={updateSessionAction.bind(null, session.id)}
          session={session}
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
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {confirmed.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="p-3">{r.firstName} {r.lastName}</td>
                    <td className="p-3">{r.nickname}</td>
                    <td className="p-3"><a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a></td>
                    <td className="p-3">{r.arrivalTime ?? formatTime(session.startsAt)}</td>
                    <td className="p-3">{r.departureTime ?? formatTime(session.endsAt)}</td>
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
    </div>
  );
}
