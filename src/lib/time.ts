export const TZ = "Europe/Prague";

const dateFmt = new Intl.DateTimeFormat("cs-CZ", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("cs-CZ", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(d: Date) {
  const s = dateFmt.format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatTime(d: Date) {
  return timeFmt.format(d);
}

export function formatRange(start: Date, end: Date) {
  return `${formatDate(start)}, ${formatTime(start)}–${formatTime(end)}`;
}

/** Offset of Europe/Prague from UTC at a given instant, in minutes. */
function tzOffsetMinutes(at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return (asUtc - at.getTime()) / 60000;
}

/** Parses "YYYY-MM-DDTHH:mm" (value of <input type="datetime-local">) as Prague local time. */
export function pragueLocalToDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const offset = tzOffsetMinutes(new Date(guess));
  const result = new Date(guess - offset * 60000);
  // second pass handles DST boundary edge cases
  const offset2 = tzOffsetMinutes(result);
  if (offset2 !== offset) return new Date(guess - offset2 * 60000);
  return result;
}

/** Formats a Date as "YYYY-MM-DDTHH:mm" in Prague time for <input type="datetime-local">. */
export function dateToPragueLocal(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
