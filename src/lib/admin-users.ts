import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminInvites, adminUsers, type AdminRole } from "@/db/schema";

export const INVITE_DAYS = 7;

export async function countAdminUsers() {
  const [{ c }] = await db.select({ c: sql<number>`count(*)::int` }).from(adminUsers);
  return c;
}

export async function listAdminUsers() {
  return db.select().from(adminUsers).orderBy(asc(adminUsers.createdAt));
}

/** Open invites (unused and not expired), newest first. */
export async function listOpenInvites() {
  return db
    .select()
    .from(adminInvites)
    .where(and(isNull(adminInvites.usedAt), gt(adminInvites.expiresAt, new Date())))
    .orderBy(desc(adminInvites.createdAt));
}

export async function createInvite(createdBy: number, role: AdminRole, note: string | null) {
  const token = randomBytes(24).toString("base64url");
  const [invite] = await db
    .insert(adminInvites)
    .values({
      token,
      role,
      note,
      createdBy,
      expiresAt: new Date(Date.now() + INVITE_DAYS * 864e5),
    })
    .returning();
  return invite;
}

/** A usable invite for the token, or null when unknown, used or expired. */
export async function getOpenInvite(token: string) {
  const invite = await db.query.adminInvites.findFirst({ where: eq(adminInvites.token, token) });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) return null;
  return invite;
}
