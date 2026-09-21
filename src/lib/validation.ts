import { z } from "zod";
import { adminRoles, cities } from "@/db/schema";
import type { Dict } from "@/i18n/dictionaries";
import { PASSWORD_MIN_LENGTH } from "./password";
import { TIME_RE } from "./time";

export function registrationSchema(t: Dict["errors"]) {
  const optionalTime = z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.string().regex(TIME_RE, t.timeFormat).nullable());

  return z.object({
    firstName: z.string().trim().min(1, t.fillFirstName).max(100),
    lastName: z.string().trim().min(1, t.fillLastName).max(100),
    nickname: z.string().trim().min(1, t.fillNickname).max(100),
    email: z.string().trim().toLowerCase().email(t.invalidEmail).max(200),
    arrivalTime: optionalTime,
    departureTime: optionalTime,
    canStorytell: checkbox,
    isNewbie: checkbox,
    website: z.string().max(0).optional(), // honeypot
  });
}

/** <input type="checkbox"> sends "on" when checked and nothing at all otherwise. */
const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true" || v === "1");

export function broadcastSchema(t: Dict["admin"]["errors"]) {
  return z.object({
    subject: z.string().trim().min(1, t.fillSubject).max(200),
    message: z.string().trim().min(1, t.writeMessage).max(5000),
    includeWaitlist: checkbox,
  });
}

export function registrationEditSchema(t: Dict["errors"]) {
  return registrationSchema(t).omit({ email: true, website: true });
}

export function sessionSchema(t: Dict["admin"]["errors"]) {
  return z.object({
    title: z.string().trim().min(1, t.fillTitle).max(200),
    city: z.enum(cities),
    startsAt: z.string().min(1, t.fillStart),
    endsAt: z.string().min(1, t.fillEnd),
    place: z.string().trim().min(1, t.fillPlace).max(300),
    capacity: z.coerce.number().int().min(1, t.capacityMin).max(500),
    note: z
      .string()
      .trim()
      .max(2000)
      .transform((v) => (v === "" ? null : v)),
  });
}

const scriptLinkSchema = z.object({
  name: z.string().trim().min(1).max(200),
  url: z
    .string()
    .trim()
    // "botcscripts.com/…" → "https://botcscripts.com/…"
    .transform((u) => (/^[a-z][a-z0-9+.-]*:\/\//i.test(u) ? u : `https://${u}`))
    .pipe(z.string().url().max(2000)),
});

/** Reads scriptName[] / scriptUrl[] pairs from a FormData, ignoring fully empty rows. */
export function parseScripts(formData: FormData, t: Dict["admin"]["errors"]) {
  const names = formData.getAll("scriptName").map(String);
  const urls = formData.getAll("scriptUrl").map(String);
  const rows = names.map((name, i) => ({ name, url: urls[i] ?? "" }));
  const filled = rows.filter((r) => r.name.trim() || r.url.trim());
  const result = z.array(scriptLinkSchema).safeParse(
    filled.map((r) => ({ name: r.name.trim() || r.url.trim(), url: r.url })),
  );
  if (!result.success) {
    const bad = result.error.issues.map((i) => Number(i.path[0]) + 1);
    return {
      error: [t.scriptUrl([...new Set(bad)].join(", "))],
    };
  }
  return { scripts: result.data };
}

/** Nickname + e-mail + password twice; shared by the first-account setup and invitation forms. */
export function accountSchema(t: Dict["admin"]["errors"]) {
  return z
    .object({
      nickname: z.string().trim().min(1, t.fillNickname).max(100),
      email: z.string().trim().toLowerCase().email(t.invalidEmail).max(200),
      password: z.string().min(PASSWORD_MIN_LENGTH, t.passwordShort(PASSWORD_MIN_LENGTH)).max(200),
      passwordAgain: z.string(),
    })
    .refine((v) => v.password === v.passwordAgain, { message: t.passwordsDiffer, path: ["passwordAgain"] });
}

export const inviteSchema = z.object({
  role: z.enum(adminRoles),
  note: z
    .string()
    .trim()
    .max(200)
    .transform((v) => (v === "" ? null : v)),
});

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function fieldErrorsOf(err: z.ZodError) {
  return err.flatten().fieldErrors as Record<string, string[] | undefined>;
}
