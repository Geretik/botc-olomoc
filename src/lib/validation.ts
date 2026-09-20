import { z } from "zod";
import { TIME_RE } from "./time";

const optionalTime = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.string().regex(TIME_RE, "Čas zadej ve formátu HH:MM").nullable());

export const registrationSchema = z.object({
  firstName: z.string().trim().min(1, "Vyplň jméno").max(100),
  lastName: z.string().trim().min(1, "Vyplň příjmení").max(100),
  nickname: z.string().trim().min(1, "Vyplň přezdívku").max(100),
  email: z.string().trim().toLowerCase().email("Zadej platný e-mail").max(200),
  arrivalTime: optionalTime,
  departureTime: optionalTime,
  website: z.string().max(0).optional(), // honeypot
});

export const registrationEditSchema = registrationSchema.omit({
  email: true,
  website: true,
});

export const sessionSchema = z.object({
  title: z.string().trim().min(1, "Vyplň název").max(200),
  startsAt: z.string().min(1, "Vyplň začátek"),
  endsAt: z.string().min(1, "Vyplň konec"),
  place: z.string().trim().min(1, "Vyplň místo").max(300),
  capacity: z.coerce.number().int().min(1, "Kapacita musí být alespoň 1").max(500),
  note: z
    .string()
    .trim()
    .max(2000)
    .transform((v) => (v === "" ? null : v)),
});

const scriptLinkSchema = z.object({
  name: z.string().trim().min(1).max(200),
  url: z
    .string()
    .trim()
    // "botcscripts.com/…" → "https://botcscripts.com/…"
    .transform((u) => (/^[a-z][a-z0-9+.-]*:\/\//i.test(u) ? u : `https://${u}`))
    .pipe(z.string().url("Zadej platnou adresu (https://…)").max(2000)),
});

/** Reads scriptName[] / scriptUrl[] pairs from a FormData, ignoring fully empty rows. */
export function parseScripts(formData: FormData) {
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
      error: [
        `Script č. ${[...new Set(bad)].join(", ")} nemá platnou webovou adresu (např. https://botcscripts.com/…).`,
      ],
    };
  }
  return { scripts: result.data };
}

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function fieldErrorsOf(err: z.ZodError) {
  return err.flatten().fieldErrors as Record<string, string[] | undefined>;
}
