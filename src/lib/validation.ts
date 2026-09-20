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

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function fieldErrorsOf(err: z.ZodError) {
  return err.flatten().fieldErrors as Record<string, string[] | undefined>;
}
