import { Resend } from "resend";
import type { Registration, Session } from "@/db/schema";
import { formatRange, formatTime } from "./time";
import { editUrl } from "./site";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function send(to: string, subject: string, html: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.log(`[email → ${to}] ${subject}\n${text}`);
    return;
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, html, text });
  if (error) {
    console.error("Resend error", error);
    throw new Error("Odeslání e-mailu se nezdařilo.");
  }
}

function registrationSummary(reg: Registration, session: Session) {
  const arrival = reg.arrivalTime ?? formatTime(session.startsAt);
  const departure = reg.departureTime ?? formatTime(session.endsAt);
  return { arrival, departure };
}

export async function sendConfirmationEmail(
  reg: Registration,
  session: Session,
) {
  const { arrival, departure } = registrationSummary(reg, session);
  const link = editUrl(reg.editToken);
  const when = formatRange(session.startsAt, session.endsAt);

  const text = `Ahoj ${reg.firstName},

tvoje registrace na Blood on the Clocktower je potvrzená.

Termín: ${session.title}
Kdy: ${when}
Kde: ${session.place}
Tvůj příchod / odchod: ${arrival} – ${departure}

Registraci můžeš upravit nebo zrušit na tomto odkazu (nikomu ho neposílej):
${link}

Těšíme se na tebe!`;

  const html = `<p>Ahoj ${escapeHtml(reg.firstName)},</p>
<p>tvoje registrace na <strong>Blood on the Clocktower</strong> je potvrzená.</p>
<table cellpadding="4" style="border-collapse:collapse">
<tr><td><strong>Termín</strong></td><td>${escapeHtml(session.title)}</td></tr>
<tr><td><strong>Kdy</strong></td><td>${escapeHtml(when)}</td></tr>
<tr><td><strong>Kde</strong></td><td>${escapeHtml(session.place)}</td></tr>
<tr><td><strong>Příchod / odchod</strong></td><td>${arrival} – ${departure}</td></tr>
</table>
<p>Registraci můžeš <a href="${link}">upravit nebo zrušit zde</a>. Odkaz je jen pro tebe, nikomu ho neposílej.</p>
<p>Těšíme se na tebe!</p>`;

  await send(reg.email, `Potvrzení registrace: ${session.title}`, html, text);
}

export async function sendExistingRegistrationEmail(
  reg: Registration,
  session: Session,
) {
  const link = editUrl(reg.editToken);
  const text = `Ahoj ${reg.firstName},

na termín "${session.title}" (${formatRange(session.startsAt, session.endsAt)}) už jsi registrovaný/á.

Registraci můžeš upravit nebo zrušit zde:
${link}`;

  const html = `<p>Ahoj ${escapeHtml(reg.firstName)},</p>
<p>na termín <strong>${escapeHtml(session.title)}</strong> (${escapeHtml(formatRange(session.startsAt, session.endsAt))}) už jsi registrovaný/á.</p>
<p>Registraci můžeš <a href="${link}">upravit nebo zrušit zde</a>.</p>`;

  await send(reg.email, `Tvoje registrace: ${session.title}`, html, text);
}
