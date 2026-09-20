import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  place: text("place").notNull(),
  capacity: integer("capacity").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

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
    status: text("status", { enum: ["confirmed", "cancelled"] })
      .notNull()
      .default("confirmed"),
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

export type Session = typeof sessions.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
