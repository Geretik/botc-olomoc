import Link from "next/link";
import { cities, type City } from "@/db/schema";
import type { Dict } from "@/i18n/dictionaries";

export function isCity(v: unknown): v is City {
  return typeof v === "string" && (cities as readonly string[]).includes(v);
}

export function CityBadge({ city, t, className = "" }: { city: City; t: Dict; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted ${className}`}
      title={t.city.label}
    >
      {t.city[city]}
    </span>
  );
}

/** "All cities | Olomouc | Prague" filter; the selection lives in the ?city= query parameter. */
export function CityTabs({ current, t, basePath = "/" }: { current?: City; t: Dict; basePath?: string }) {
  const tab = (href: string, label: string, active: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        active ? "bg-accent text-accent-foreground" : "border border-border hover:border-accent"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <nav aria-label={t.city.label} className="flex flex-wrap gap-2">
      {tab(basePath, t.city.all, !current)}
      {cities.map((c) => tab(`${basePath}?city=${c}`, t.city[c], current === c))}
    </nav>
  );
}
