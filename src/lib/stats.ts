import { and, desc, eq, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { registrations, sessions } from "@/db/schema";

export type PastSessionStats = {
  id: number;
  title: string;
  startsAt: Date;
  capacity: number;
  confirmed: number;
  attended: number;
  noShow: number;
  marked: number;
  newbies: number;
};

export async function pastSessionStats(): Promise<PastSessionStats[]> {
  const rows = await db
    .select({
      id: sessions.id,
      title: sessions.title,
      startsAt: sessions.startsAt,
      capacity: sessions.capacity,
      confirmed: sql<number>`count(*) filter (where ${registrations.status} = 'confirmed')::int`,
      attended: sql<number>`count(*) filter (where ${registrations.status} = 'confirmed' and ${registrations.attended} is true)::int`,
      noShow: sql<number>`count(*) filter (where ${registrations.status} = 'confirmed' and ${registrations.attended} is false)::int`,
      marked: sql<number>`count(*) filter (where ${registrations.status} = 'confirmed' and ${registrations.attended} is not null)::int`,
      newbies: sql<number>`count(*) filter (where ${registrations.status} = 'confirmed' and ${registrations.isNewbie})::int`,
    })
    .from(sessions)
    .leftJoin(registrations, eq(registrations.sessionId, sessions.id))
    .where(lt(sessions.endsAt, new Date()))
    .groupBy(sessions.id)
    .orderBy(desc(sessions.startsAt));
  return rows;
}

export type Regular = {
  email: string;
  nickname: string;
  sessions: number;
  attended: number;
  noShow: number;
  lastAt: Date;
};

/** Players by number of past sessions they were signed up for (confirmed). */
export async function regulars(limit = 20): Promise<Regular[]> {
  const rows = await db
    .select({
      email: sql<string>`lower(${registrations.email})`,
      nickname: sql<string>`(array_agg(${registrations.nickname} order by ${sessions.startsAt} desc))[1]`,
      sessions: sql<number>`count(*)::int`,
      attended: sql<number>`count(*) filter (where ${registrations.attended} is true)::int`,
      noShow: sql<number>`count(*) filter (where ${registrations.attended} is false)::int`,
      lastAt: sql<Date>`max(${sessions.startsAt})`,
    })
    .from(registrations)
    .innerJoin(sessions, eq(registrations.sessionId, sessions.id))
    .where(and(eq(registrations.status, "confirmed"), lt(sessions.endsAt, new Date())))
    .groupBy(sql`lower(${registrations.email})`)
    .orderBy(desc(sql`count(*)`), desc(sql`max(${sessions.startsAt})`))
    .limit(limit);
  return rows.map((r) => ({ ...r, lastAt: new Date(r.lastAt) }));
}

export type Totals = {
  pastSessions: number;
  upcomingSessions: number;
  registrations: number;
  uniquePlayers: number;
  avgOccupancy: number | null;
  attendanceRate: number | null;
};

export async function totals(): Promise<Totals> {
  const now = new Date();
  const [s] = await db
    .select({
      past: sql<number>`count(*) filter (where ${sessions.endsAt} < ${now})::int`,
      upcoming: sql<number>`count(*) filter (where ${sessions.endsAt} >= ${now})::int`,
    })
    .from(sessions);
  const [r] = await db
    .select({
      registrations: sql<number>`count(*)::int`,
      uniquePlayers: sql<number>`count(distinct lower(${registrations.email}))::int`,
      attended: sql<number>`count(*) filter (where ${registrations.attended} is true)::int`,
      marked: sql<number>`count(*) filter (where ${registrations.attended} is not null)::int`,
    })
    .from(registrations)
    .innerJoin(sessions, eq(registrations.sessionId, sessions.id))
    .where(and(eq(registrations.status, "confirmed"), lt(sessions.endsAt, now)));
  const [o] = await db
    .select({
      avg: sql<number | null>`avg(least(1.0, (
        select count(*)::numeric from ${registrations} x
        where x.session_id = ${sessions}.id and x.status = 'confirmed'
      ) / ${sessions.capacity}))`,
    })
    .from(sessions)
    .where(lt(sessions.endsAt, now));
  return {
    pastSessions: s.past,
    upcomingSessions: s.upcoming,
    registrations: r.registrations,
    uniquePlayers: r.uniquePlayers,
    avgOccupancy: o.avg === null ? null : Number(o.avg),
    attendanceRate: r.marked ? r.attended / r.marked : null,
  };
}
