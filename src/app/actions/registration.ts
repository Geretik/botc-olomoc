"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { registrations, sessions } from "@/db/schema";
import {
  sendConfirmationEmail,
  sendExistingRegistrationEmail,
} from "@/lib/email";
import { generateEditToken } from "@/lib/token";
import {
  fieldErrorsOf,
  registrationEditSchema,
  registrationSchema,
  type FormState,
} from "@/lib/validation";

// Note: no revalidatePath() here on purpose. All public pages are force-dynamic,
// and revalidating would re-render the current page and replace the success
// message with the server state (e.g. "Termín je plný" for the last spot).

export type RegisterResult = FormState & {
  outcome?: "created" | "already_registered";
  emailFailed?: boolean;
};

async function trySend(fn: () => Promise<void>) {
  try {
    await fn();
    return false;
  } catch (e) {
    console.error("E-mail se nepodařilo odeslat", e);
    return true;
  }
}

export async function registerAction(
  sessionId: number,
  _prev: RegisterResult,
  formData: FormData,
): Promise<RegisterResult> {
  const parsed = registrationSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { error: "Zkontroluj prosím formulář.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const data = parsed.data;
  if (data.website) {
    // honeypot hit – pretend success
    return { ok: true, outcome: "created" };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [session] = await tx
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .for("update");
      if (!session) return { kind: "not_found" as const };
      if (session.endsAt < new Date()) return { kind: "past" as const };

      const existing = await tx.query.registrations.findFirst({
        where: and(
          eq(registrations.sessionId, sessionId),
          eq(sql`lower(${registrations.email})`, data.email),
        ),
      });

      if (existing && existing.status === "confirmed") {
        return { kind: "already" as const, session, registration: existing };
      }

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(registrations)
        .where(
          and(
            eq(registrations.sessionId, sessionId),
            eq(registrations.status, "confirmed"),
          ),
        );
      if (count >= session.capacity) return { kind: "full" as const };

      const values = {
        firstName: data.firstName,
        lastName: data.lastName,
        nickname: data.nickname,
        arrivalTime: data.arrivalTime,
        departureTime: data.departureTime,
        status: "confirmed" as const,
        updatedAt: new Date(),
      };

      let registration;
      if (existing) {
        // previously cancelled → re-activate with a fresh token
        [registration] = await tx
          .update(registrations)
          .set({ ...values, editToken: generateEditToken() })
          .where(eq(registrations.id, existing.id))
          .returning();
      } else {
        [registration] = await tx
          .insert(registrations)
          .values({
            ...values,
            sessionId,
            email: data.email,
            editToken: generateEditToken(),
          })
          .returning();
      }
      return { kind: "created" as const, session, registration };
    });

    switch (result.kind) {
      case "not_found":
        return { error: "Termín neexistuje." };
      case "past":
        return { error: "Tento termín už proběhl." };
      case "full":
        return { error: "Termín je bohužel už plný." };
      case "already": {
        const emailFailed = await trySend(() =>
          sendExistingRegistrationEmail(result.registration, result.session),
        );
        return { ok: true, outcome: "already_registered", emailFailed };
      }
      case "created": {
        const emailFailed = await trySend(() =>
          sendConfirmationEmail(result.registration, result.session),
        );
        return { ok: true, outcome: "created", emailFailed };
      }
    }
  } catch (e) {
    console.error(e);
    return { error: "Něco se pokazilo. Zkus to prosím znovu." };
  }
}

export async function updateRegistrationAction(
  token: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registrationEditSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { error: "Zkontroluj prosím formulář.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const [updated] = await db
    .update(registrations)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(
        eq(registrations.editToken, token),
        eq(registrations.status, "confirmed"),
      ),
    )
    .returning({ id: registrations.id });
  if (!updated) return { error: "Registrace nebyla nalezena nebo je zrušená." };
  return { ok: true };
}

export async function cancelRegistrationAction(token: string): Promise<FormState> {
  const [updated] = await db
    .update(registrations)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(registrations.editToken, token))
    .returning({ sessionId: registrations.sessionId });
  if (!updated) return { error: "Registrace nebyla nalezena." };
  return { ok: true };
}
