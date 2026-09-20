"use server";

import { eq } from "drizzle-orm";
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
import { pragueLocalToDate } from "@/lib/time";
import {
  fieldErrorsOf,
  parseScripts,
  sessionSchema,
  type FormState,
} from "@/lib/validation";

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
  await db.insert(sessions).values(r.values);
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

export async function adminCancelRegistrationAction(registrationId: number) {
  await requireAdmin();
  const [row] = await db
    .update(registrations)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(registrations.id, registrationId))
    .returning({ sessionId: registrations.sessionId });
  if (row) {
    revalidatePath("/");
    revalidatePath(`/admin/termin/${row.sessionId}`);
  }
}

export async function adminRestoreRegistrationAction(registrationId: number) {
  await requireAdmin();
  const [row] = await db
    .update(registrations)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(eq(registrations.id, registrationId))
    .returning({ sessionId: registrations.sessionId });
  if (row) {
    revalidatePath("/");
    revalidatePath(`/admin/termin/${row.sessionId}`);
  }
}
