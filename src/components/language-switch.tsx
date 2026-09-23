import { setLocaleAction } from "@/app/actions/locale";
import type { Dict, Locale } from "@/i18n/dictionaries";

export function LanguageSwitch({ locale, t, className = "" }: { locale: Locale; t: Dict; className?: string }) {
  const other: Locale = locale === "cs" ? "en" : "cs";
  return (
    <form action={setLocaleAction} className={className}>
      <input type="hidden" name="locale" value={other} />
      <button
        type="submit"
        className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted hover:border-accent hover:text-accent"
        aria-label={t.lang.label}
        title={t.lang.label}
      >
        {t.lang.switchTo}
      </button>
    </form>
  );
}
