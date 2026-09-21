import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const cities = ["olomouc", "praha"] as const;
export type City = (typeof cities)[number];

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  /** Which city the game night is in – the public site can filter by it */
  city: text("city", { enum: cities }).notNull().default("olomouc"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  place: text("place").notNull(),
  capacity: integer("capacity").notNull(),
  /** Who runs the game that night – free text, optional */
  storyteller: text("storyteller"),
  /** Set once the "N spots left" Discord post two days before the game went out */
  spotsPostedAt: timestamp("spots_posted_at", { withTimezone: true }),
  note: text("note"),
  /** Links to scripts played that evening (botcscripts.com, script tool, PDF on a drive, …) */
  scripts: jsonb("scripts").$type<ScriptLink[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ScriptLink = { name: string; url: string };

export const registrations = pgTable(
  "registrations",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    nickname: text("nickname").notNull(),
    email: text("email").notNull(),
    /** "HH:MM" in Europe/Prague, null = same as session start */
    arrivalTime: text("arrival_time"),
    /** "HH:MM" in Europe/Prague, null = same as session end */
    departureTime: text("departure_time"),
    status: text("status", { enum: ["confirmed", "waitlisted", "cancelled"] })
      .notNull()
      .default("confirmed"),
    /** When the player joined the waitlist – decides the order of promotion */
    waitlistedAt: timestamp("waitlisted_at", { withTimezone: true }),
    /** Player is willing to run the game as the Storyteller */
    canStorytell: boolean("can_storytell").notNull().default(false),
    /** Player is new to the game */
    isNewbie: boolean("is_newbie").notNull().default(false),
    /** Free-text note for the organisers, never shown publicly */
    note: text("note"),
    /** Why the player cancelled (optional) and when */
    cancelReason: text("cancel_reason"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    /** Salted hash of the client IP, only for rate limiting sign-ups */
    ipHash: text("ip_hash"),
    /** Attendance marked by the organiser after the session; null = not marked */
    attended: boolean("attended"),
    /** Set when the "tomorrow is game night" reminder was sent – sent at most once */
    reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
    /** UI language the player used; e-mails are sent in it */
    locale: text("locale", { enum: ["cs", "en"] }).notNull().default("cs"),
    /** Set once the confirmation e-mail for the current (re)activation was sent – never send it twice */
    confirmationSentAt: timestamp("confirmation_sent_at", { withTimezone: true }),
    /** Last time any e-mail went to this registration – throttles "already registered" re-sends */
    lastEmailAt: timestamp("last_email_at", { withTimezone: true }),
    editToken: text("edit_token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("registrations_session_email_idx").on(
      t.sessionId,
      sql`lower(${t.email})`,
    ),
  ],
);

export const sessionsRelations = relations(sessions, ({ many }) => ({
  registrations: many(registrations),
}));

export const registrationsRelations = relations(registrations, ({ one }) => ({
  session: one(sessions, {
    fields: [registrations.sessionId],
    references: [sessions.id],
  }),
}));

export const adminRoles = ["admin", "organizer"] as const;
export type AdminRole = (typeof adminRoles)[number];

/** Organiser accounts for /admin. Passwords are stored as scrypt hashes (see lib/password.ts). */
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  /** admin = manages accounts and invites too; organizer = sessions and registrations only */
  role: text("role", { enum: adminRoles }).notNull().default("organizer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

/** One-time invitation links; whoever opens one creates their own account. */
export const adminInvites = pgTable("admin_invites", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  role: text("role", { enum: adminRoles }).notNull().default("organizer"),
  /** Optional note for the admin, e.g. who the invite is for */
  note: text("note"),
  createdBy: integer("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  usedBy: integer("used_by").references(() => adminUsers.id, { onDelete: "set null" }),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type AdminInvite = typeof adminInvites.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
export type RegistrationStatus = Registration["status"];
