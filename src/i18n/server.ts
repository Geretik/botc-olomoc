import { cookies, headers } from "next/headers";
import { defaultLocale, dictionaries, locales, type Locale } from "./dictionaries";

export const LOCALE_COOKIE = "botc_lang";

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (locales as readonly string[]).includes(v);
}

/** Locale from cookie, else from Accept-Language, else Czech. */
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const accept = (await headers()).get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("cs") || first.startsWith("sk")) return "cs";
  if (first.startsWith("en")) return "en";
  return defaultLocale;
}

export async function getDict() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
