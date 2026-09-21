import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adminCancelRegistrationAction,
  adminConfirmWaitlistedAction,
  adminResendLinkAction,
  adminRestoreRegistrationAction,
  announceDiscordAction,
  deleteGameAction,
  deleteSessionAction,
  sendRemindersNowAction,
  updateSessionAction,
} from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { CityBadge } from "@/components/city";
import { AttendanceToggle } from "@/components/admin/attendance-toggle";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { DeleteSessionButton } from "@/components/admin/delete-session-button";
import { GameForm } from "@/components/admin/game-form";
import { SessionForm } from "@/components/admin/session-form";
import { Alert, Button, Card } from "@/components/ui";
import type { Registration } from "@/db/schema";
import type { Dict } from "@/i18n/dictionaries";
import { getDict } from "@/i18n/server";
import { discordConfigured } from "@/lib/discord";
import { getSessionWithCount, listGamesForSession, listRegistrationsForSession } from "@/lib/queries";
import { countPendingReminders } from "@/lib/reminders";
import { dateToPragueLocal, formatDate, formatTime } from "@/lib/time";
import { editUrl } from "@/lib/site";

function Flags({ r, t }: { r: Registration; t: Dict["admin"]["session"] }) {
  return (
    <>
      {r.canStorytell && <span title={t.storyteller} aria-label={t.storyteller}> 🎩</span>}
      {r.isNewbie && <span title={t.newbie} aria-label={t.newbie}> 🌱</span>}
      {r.status !== "cancelled" && !r.confirmationSentAt && (
        <span title={t.noConfirmation} aria-label={t.noConfirmation}> ⚠️</span>
      )}
      {r.note && <span title={`${t.playerNote}: ${r.note}`} aria-label={t.playerNote}> 📝</span>}
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
  const [{ locale, t: dict }, session, regs, pendingReminders, playedGames] = await Promise.all([
    getDict(),
    getSessionWithCount(numId),
    listRegistrationsForSession(numId),
    countPendingReminders(numId),
    listGamesForSession(numId),
  ]);
  if (!session) notFound();
  const t = dict.admin.session;

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
  const unconfirmed = confirmed.filter((r) => !r.confirmationSentAt).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="flex items-center gap-3 text-2xl font-bold">{session.title}<CityBadge city={session.city} t={dict} /></h1>
        <DeleteSessionButton
          action={deleteSessionAction.bind(null, session.id)}
          label={t.deleteSession}
          confirmText={t.deleteConfirm}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href={`/termin/${session.id}`} className="rounded-md border border-border bg-card px-3 py-2 hover:border-accent">
          {t.publicPage}
        </Link>
        <Link href={`/admin/novy?from=${session.id}`} className="rounded-md border border-border bg-card px-3 py-2 hover:border-accent">
          {t.duplicate}
        </Link>
        <a href={`/admin/termin/${session.id}/export.csv`} className="rounded-md border border-border bg-card px-3 py-2 hover:border-accent">
          {t.exportCsv}
        </a>
        {!past && (
          <ActionButton
            action={sendRemindersNowAction.bind(null, session.id)}
            label={t.sendReminder(pendingReminders)}
            pendingLabel={t.sending}
            confirmText={t.sendReminderConfirm(pendingReminders)}
          />
        )}
        {!past && (
          <ActionButton
            action={announceDiscordAction.bind(null, session.id)}
            label={t.announceDiscord}
            pendingLabel={t.sending}
            confirmText={discordConfigured() ? t.announceDiscordConfirm : undefined}
          />
        )}
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">{t.edit}</h2>
        <SessionForm
          action={updateSessionAction.bind(null, session.id)}
          session={session}
          mode="edit"
          defaults={{
            startsAt: dateToPragueLocal(session.startsAt),
            endsAt: dateToPragueLocal(session.endsAt),
          }}
          t={dict.admin.form}
          cityNames={dict.city}
        />
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t.registered(confirmed.length, session.capacity)}</h2>
        <p className="text-sm text-muted">
          {t.summary(storytellers, newbies)}
          {(attended > 0 || noShow > 0) && t.attendanceSummary(attended, noShow)}
        </p>
        {unconfirmed > 0 && <Alert kind="error">{t.noConfirmationCount(unconfirmed)}</Alert>}
        {confirmed.length === 0 && <p className="text-muted">{t.nobody}</p>}
        {confirmed.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-border">
                  <th className="p-3">{t.name}</th>
                  <th className="p-3">{t.nickname}</th>
                  <th className="p-3">{t.email}</th>
                  <th className="p-3">{t.arrival}</th>
                  <th className="p-3">{t.departure}</th>
                  <th className="p-3" title={t.attendance}>{t.attended}</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {confirmed.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="p-3 whitespace-nowrap">{r.firstName} {r.lastName}</td>
                    <td className="p-3 whitespace-nowrap">{r.nickname}<Flags r={r} t={t} /></td>
                    <td className="p-3 whitespace-nowrap"><a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a></td>
                    <td className="p-3 whitespace-nowrap">{r.arrivalTime ?? formatTime(session.startsAt, locale)}</td>
                    <td className="p-3 whitespace-nowrap">{r.departureTime ?? formatTime(session.endsAt, locale)}</td>
                    <td className="p-3">
                      <AttendanceToggle registrationId={r.id} attended={r.attended} labels={{ came: t.came, noShow: t.noShow }} />
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <a href={editUrl(r.editToken)} className="mr-3 text-muted hover:underline" target="_blank" rel="noreferrer">{t.link}</a>
                      <span className="mr-3">
                        <ActionButton
                          action={adminResendLinkAction.bind(null, r.id)}
                          label="✉️"
                          pendingLabel="…"
                          title={t.resendLink}
                          confirmText={t.resendLinkConfirm}
                        />
                      </span>
                      <form action={adminCancelRegistrationAction.bind(null, r.id)} className="inline">
                        <Button type="submit" variant="danger">{t.cancel}</Button>
                      </form>
                    </td>
                  </tr>
                ))}
                {confirmed.some((r) => r.note) && (
                  <tr className="bg-border/20 text-xs text-muted">
                    <td colSpan={7} className="p-3">
                      <strong>{t.playerNote}:</strong>{" "}
                      {confirmed.filter((r) => r.note).map((r) => `${r.nickname}: „${r.note}“`).join(" · ")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {confirmed.length > 0 && (
          <p className="text-xs text-muted">
            {t.allEmails}<span className="select-all">{confirmed.map((r) => r.email).join(", ")}</span>
          </p>
        )}
      </section>

      {waitlisted.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{t.waitlist(waitlisted.length)}</h2>
          <p className="text-sm text-muted">{t.waitlistHint}</p>
          <ol className="flex flex-col gap-2 text-sm">
            {waitlisted.map((r, i) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2">
                <span>
                  <span className="mr-2 font-semibold text-muted">{i + 1}.</span>
                  {r.firstName} {r.lastName} ({r.nickname}<Flags r={r} t={t} />) · {r.email}
                </span>
                <span className="flex gap-2">
                  <a href={editUrl(r.editToken)} className="self-center text-muted hover:underline" target="_blank" rel="noreferrer">{t.link}</a>
                  <form action={adminConfirmWaitlistedAction.bind(null, r.id)}>
                    <Button type="submit" variant="secondary">{t.confirm}</Button>
                  </form>
                  <form action={adminCancelRegistrationAction.bind(null, r.id)}>
                    <Button type="submit" variant="danger">{t.cancel}</Button>
                  </form>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {cancelled.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-muted">{t.cancelled(cancelled.length)}</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {cancelled.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2">
                <span className="text-muted">
                  {r.firstName} {r.lastName} ({r.nickname}) · {r.email}
                  {r.cancelledAt && <> · {t.cancelledAt} {formatDate(r.cancelledAt, locale)} {formatTime(r.cancelledAt, locale)}</>}
                  {r.cancelReason && <> · {t.cancelReason}: „{r.cancelReason}“</>}
                </span>
                <form action={adminRestoreRegistrationAction.bind(null, r.id)}>
                  <Button type="submit" variant="secondary">{t.restore}</Button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Card>
        <h2 className="mb-1 text-lg font-semibold">🎲 {t.gamesTitle}</h2>
        <p className="mb-4 text-sm text-muted">{t.gamesHint}</p>
        {playedGames.length === 0 && <p className="mb-4 text-sm text-muted">{t.gamesNone}</p>}
        {playedGames.length > 0 && (
          <ol className="mb-4 flex flex-col gap-2 text-sm">
            {playedGames.map((g, i) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                <span>
                  <span className="mr-2 font-semibold text-muted">{i + 1}.</span>
                  {g.scriptUrl ? <a href={g.scriptUrl} className="hover:underline" target="_blank" rel="noreferrer">{g.scriptName}</a> : g.scriptName}
                  {g.winner && <> · {g.winner === "good" ? "😇" : "😈"} {dict.archive.winner[g.winner]}</>}
                  {g.players && <span className="text-muted"> · {dict.archive.gamePlayers(g.players)}</span>}
                  {g.notes && <span className="text-muted"> · {g.notes}</span>}
                </span>
                <form action={deleteGameAction.bind(null, g.id)}>
                  <Button type="submit" variant="danger">{t.gameDelete}</Button>
                </form>
              </li>
            ))}
          </ol>
        )}
        <GameForm
          sessionId={session.id}
          scripts={session.scripts}
          t={{
            gameScript: t.gameScript,
            gameScriptCustom: t.gameScriptCustom,
            gameWinner: t.gameWinner,
            gameWinnerUnknown: t.gameWinnerUnknown,
            gameWinnerGood: t.gameWinnerGood,
            gameWinnerEvil: t.gameWinnerEvil,
            gamePlayers: t.gamePlayers,
            gameNotes: t.gameNotes,
            gameAdd: t.gameAdd,
            gameAdding: t.gameAdding,
          }}
        />
      </Card>

      {!past && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold">{t.broadcastTitle}</h2>
          <p className="mb-4 text-sm text-muted">{t.broadcastHint}</p>
          <BroadcastForm
            sessionId={session.id}
            confirmedCount={confirmed.length}
            waitlistedCount={waitlisted.length}
            t={dict.admin.broadcast}
          />
        </Card>
      )}
    </div>
  );
}
