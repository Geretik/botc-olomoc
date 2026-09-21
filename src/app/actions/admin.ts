"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { registrations, sessions } from "@/db/schema";
import {
  checkPassword,
  clearAdminCookie,
  isAdmin,
  setAdminCookie,
} from "@/lib/admin-auth";
import { announceSessionOnDiscord } from "@/lib/discord";
import { sendBroadcastEmail } from "@/lib/email";
import { sendDueReminders } from "@/lib/reminders";
import { pragueLocalToDate } from "@/lib/time";
import {
  broadcastSchema,
  fieldErrorsOf,
  parseScripts,
  sessionSchema,
  type FormState,
} from "@/lib/validation";
import { promoteWaitlist } from "@/lib/waitlist";

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "Nesprávné heslo." };
  }
  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/");
}

function parseSessionForm(formData: FormData) {
  const parsed = sessionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: fieldErrorsOf(parsed.error) };
  }
  const startsAt = pragueLocalToDate(parsed.data.startsAt);
  const endsAt = pragueLocalToDate(parsed.data.endsAt);
  if (!startsAt) return { error: { startsAt: ["Neplatný začátek"] } };
  if (!endsAt) return { error: { endsAt: ["Neplatný konec"] } };
  if (endsAt <= startsAt) return { error: { endsAt: ["Konec musí být po začátku"] } };
  const scripts = parseScripts(formData);
  if (scripts.error) return { error: { scripts: scripts.error } };
  return {
    values: {
      scripts: scripts.scripts,
      title: parsed.data.title,
      place: parsed.data.place,
      capacity: parsed.data.capacity,
      note: parsed.data.note,
      startsAt,
      endsAt,
    },
  };
}

export async function createSessionAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const r = parseSessionForm(formData);
  if (r.error) return { error: "Zkontroluj formulář.", fieldErrors: r.error };
  const [created] = await db.insert(sessions).values(r.values).returning();
  if (formData.get("announceDiscord") === "on") {
    await announceSessionOnDiscord(created, created.capacity);
  }
  revalidatePath("/");
  redirect("/admin");
}

export async function updateSessionAction(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const r = parseSessionForm(formData);
  if (r.error) return { error: "Zkontroluj formulář.", fieldErrors: r.error };
  await db.update(sessions).set(r.values).where(eq(sessions.id, id));
  // a bigger capacity may make room for waitlisted players
  await promoteWaitlist(id);
  revalidatePath("/");
  revalidatePath(`/termin/${id}`);
  return { ok: true };
}

export async function deleteSessionAction(id: number) {
  await requireAdmin();
  await db.delete(sessions).where(eq(sessions.id, id));
  revalidatePath("/");
  redirect("/admin");
}

function revalidateSession(sessionId: number) {
  revalidatePath("/");
  revalidatePath(`/termin/${sessionId}`);
  revalidatePath(`/admin/termin/${sessionId}`);
}

export async function adminCancelRegistrationAction(registrationId: number) {
  await requireAdmin();
  const [row] = await db
    .update(registrations)
    .set({ status: "cancelled", waitlistedAt: null, updatedAt: new Date() })
    .where(eq(registrations.id, registrationId))
    .returning({ sessionId: registrations.sessionId });
  if (row) {
    await promoteWaitlist(row.sessionId);
    revalidateSession(row.sessionId);
  }
}

/** Restores a cancelled registration: into a free spot, or onto the waitlist when full. */
export async function adminRestoreRegistrationAction(registrationId: number) {
  await requireAdmin();
  const row = await db.transaction(async (tx) => {
    const reg = await tx.query.registrations.findFirst({
      where: eq(registrations.id, registrationId),
    });
    if (!reg) return null;
    const [session] = await tx
      .select()
      .from(sessions)
      .where(eq(sessions.id, reg.sessionId))
      .for("update");
    const [{ confirmed, waitlisted }] = await tx
      .select({
        confirmed: sql<number>`count(*) filter (where ${registrations.status} = 'confirmed')::int`,
        waitlisted: sql<number>`count(*) filter (where ${registrations.status} = 'waitlisted')::int`,
      })
      .from(registrations)
      .where(eq(registrations.sessionId, reg.sessionId));
    const full = confirmed >= session.capacity || waitlisted > 0;
    const now = new Date();
    await tx
      .update(registrations)
      .set({
        status: full ? "waitlisted" : "confirmed",
        waitlistedAt: full ? now : null,
        updatedAt: now,
      })
      .where(eq(registrations.id, registrationId));
    return reg;
  });
  if (row) revalidateSession(row.sessionId);
}

/** Admin override: confirms a waitlisted player even beyond capacity. */
export async function adminConfirmWaitlistedAction(registrationId: number) {
  await requireAdmin();
  const [row] = await db
    .update(registrations)
    .set({ status: "confirmed", waitlistedAt: null, updatedAt: new Date() })
    .where(and(eq(registrations.id, registrationId), eq(registrations.status, "waitlisted")))
    .returning({ sessionId: registrations.sessionId });
  if (row) revalidateSession(row.sessionId);
}

/** Marks attendance: true = came, false = no-show, null = not marked. */
export async function setAttendanceAction(registrationId: number, attended: boolean | null) {
  await requireAdmin();
  const [row] = await db
    .update(registrations)
    .set({ attended, updatedAt: new Date() })
    .where(eq(registrations.id, registrationId))
    .returning({ sessionId: registrations.sessionId });
  if (row) revalidatePath(`/admin/termin/${row.sessionId}`);
}

export type BroadcastResult = FormState & { sent?: number; failed?: number };

export async function broadcastEmailAction(
  sessionId: number,
  _prev: BroadcastResult,
  formData: FormData,
): Promise<BroadcastResult> {
  await requireAdmin();
  const parsed = broadcastSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: "Zkontroluj formulář.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, sessionId) });
  if (!session) return { error: "Termín neexistuje." };
  const statuses: ("confirmed" | "waitlisted")[] = parsed.data.includeWaitlist
    ? ["confirmed", "waitlisted"]
    : ["confirmed"];
  const recipients = await db.query.registrations.findMany({
    where: and(eq(registrations.sessionId, sessionId), inArray(registrations.status, statuses)),
  });
  let sent = 0;
  let failed = 0;
  for (const reg of recipients) {
    try {
      await sendBroadcastEmail(reg, session, parsed.data.subject, parsed.data.message);
      sent++;
    } catch (e) {
      console.error("Broadcast e-mail failed", e);
      failed++;
    }
  }
  if (sent > 0) {
    await db
      .update(registrations)
      .set({ lastEmailAt: new Date() })
      .where(and(eq(registrations.sessionId, sessionId), inArray(registrations.status, statuses)));
  }
  return { ok: true, sent, failed };
}

export type SimpleResult = { ok?: boolean; message?: string };

export async function sendRemindersNowAction(sessionId: number): Promise<SimpleResult> {
  await requireAdmin();
  const r = await sendDueReminders({ sessionId, ignoreWindow: true });
  revalidatePath(`/admin/termin/${sessionId}`);
  if (r.due === 0) return { ok: true, message: "Všichni přihlášení už připomínku dostali." };
  return {
    ok: r.failed === 0,
    message: `Připomínka odeslána ${r.sent}× ${r.failed ? `, ${r.failed}× selhala` : ""}.`.replace(" ,", ","),
  };
}

export async function announceDiscordAction(sessionId: number): Promise<SimpleResult> {
  await requireAdmin();
  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, sessionId) });
  if (!session) return { message: "Termín neexistuje." };
  const [{ c }] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(registrations)
    .where(and(eq(registrations.sessionId, sessionId), eq(registrations.status, "confirmed")));
  const result = await announceSessionOnDiscord(session, Math.max(0, session.capacity - c));
  return {
    ok: result === "sent",
    message: {
      sent: "Oznámení odesláno na Discord.",
      not_configured: "Discord není nastavený (chybí DISCORD_WEBHOOK_URL).",
      failed: "Odeslání na Discord selhalo, podívej se do logu.",
    }[result],
  };
}
