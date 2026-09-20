import { Resend } from "resend";
import type { Registration, Session } from "@/db/schema";
import { dictionaries, type Locale } from "@/i18n/dictionaries";
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
    throw new Error("E-mail could not be sent.");
  }
}

function localeOf(reg: Registration): Locale {
  return reg.locale === "en" ? "en" : "cs";
}

export async function sendConfirmationEmail(reg: Registration, session: Session) {
  const locale = localeOf(reg);
  const t = dictionaries[locale].email;
  const arrival = reg.arrivalTime ?? formatTime(session.startsAt, locale);
  const departure = reg.departureTime ?? formatTime(session.endsAt, locale);
  const link = editUrl(reg.editToken);
  const when = formatRange(session.startsAt, session.endsAt, locale);

  const text = `${t.hi(reg.firstName)}

${t.confirmed}

${t.session}: ${session.title}
${t.when}: ${when}
${t.where}: ${session.place}
${t.yourArrivalDeparture}: ${arrival}–${departure}

${t.editText}
${link}

${t.seeYou}`;

  const html = `<p>${escapeHtml(t.hi(reg.firstName))}</p>
<p>${escapeHtml(t.confirmed)}</p>
<table cellpadding="4" style="border-collapse:collapse">
<tr><td><strong>${t.session}</strong></td><td>${escapeHtml(session.title)}</td></tr>
<tr><td><strong>${t.when}</strong></td><td>${escapeHtml(when)}</td></tr>
<tr><td><strong>${t.where}</strong></td><td>${escapeHtml(session.place)}</td></tr>
<tr><td><strong>${t.arrivalDeparture}</strong></td><td>${arrival}–${departure}</td></tr>
</table>
<p>${t.editHtmlBefore}<a href="${link}">${t.editHtmlLink}</a>${t.editHtmlAfter}</p>
<p>${t.seeYou}</p>`;

  await send(reg.email, t.confirmSubject(session.title), html, text);
}

export async function sendExistingRegistrationEmail(reg: Registration, session: Session) {
  const locale = localeOf(reg);
  const t = dictionaries[locale].email;
  const link = editUrl(reg.editToken);
  const when = formatRange(session.startsAt, session.endsAt, locale);
  const text = `${t.hi(reg.firstName)}

${t.alreadyText(session.title, when)}

${t.alreadyEdit}
${link}`;

  const html = `<p>${escapeHtml(t.hi(reg.firstName))}</p>
<p>${escapeHtml(t.alreadyText(session.title, when))}</p>
<p>${t.editHtmlBefore}<a href="${link}">${t.editHtmlLink}</a>.</p>`;

  await send(reg.email, t.existingSubject(session.title), html, text);
}
