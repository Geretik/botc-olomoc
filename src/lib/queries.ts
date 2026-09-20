import { and, asc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { registrations, sessions } from "@/db/schema";

export type SessionWithCount = typeof sessions.$inferSelect & {
  confirmedCount: number;
};

const confirmedCount = sql<number>`(
  select count(*)::int from ${registrations} r
  where r.session_id = ${sessions}.id and r.status = 'confirmed'
)`.as("confirmed_count");

export async function listUpcomingSessions(): Promise<SessionWithCount[]> {
  const rows = await db
    .select({
      id: sessions.id,
      title: sessions.title,
      startsAt: sessions.startsAt,
      endsAt: sessions.endsAt,
      place: sessions.place,
      capacity: sessions.capacity,
      note: sessions.note,
      createdAt: sessions.createdAt,
      confirmedCount,
    })
    .from(sessions)
    .where(gte(sessions.endsAt, new Date()))
    .orderBy(asc(sessions.startsAt));
  return rows;
}

export async function listAllSessions(): Promise<SessionWithCount[]> {
  return db
    .select({
      id: sessions.id,
      title: sessions.title,
      startsAt: sessions.startsAt,
      endsAt: sessions.endsAt,
      place: sessions.place,
      capacity: sessions.capacity,
      note: sessions.note,
      createdAt: sessions.createdAt,
      confirmedCount,
    })
    .from(sessions)
    .orderBy(asc(sessions.startsAt));
}

export async function getSessionWithCount(
  id: number,
): Promise<SessionWithCount | null> {
  const rows = await db
    .select({
      id: sessions.id,
      title: sessions.title,
      startsAt: sessions.startsAt,
      endsAt: sessions.endsAt,
      place: sessions.place,
      capacity: sessions.capacity,
      note: sessions.note,
      createdAt: sessions.createdAt,
      confirmedCount,
    })
    .from(sessions)
    .where(eq(sessions.id, id));
  return rows[0] ?? null;
}

export async function getRegistrationByToken(token: string) {
  return db.query.registrations.findFirst({
    where: eq(registrations.editToken, token),
    with: { session: true },
  });
}

export async function listRegistrationsForSession(sessionId: number) {
  return db.query.registrations.findMany({
    where: and(eq(registrations.sessionId, sessionId)),
    orderBy: [asc(registrations.createdAt)],
  });
}
