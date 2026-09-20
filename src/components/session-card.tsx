import Link from "next/link";
import type { SessionWithCount } from "@/lib/queries";
import { formatDate, formatTime } from "@/lib/time";
import { EditPencil } from "./edit-pencil";
import { ScriptLinks } from "./script-links";
import { Card } from "./ui";

export function freeSpots(s: SessionWithCount) {
  return Math.max(0, s.capacity - s.confirmedCount);
}

export function SessionCard({ session: s, admin = false }: { session: SessionWithCount; admin?: boolean }) {
  const free = freeSpots(s);
  const full = free === 0;
  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          {s.title}
          {admin && <EditPencil sessionId={s.id} />}
        </h2>
        <p className="text-sm">
          <span>{formatDate(s.startsAt)}</span>,{" "}
          {formatTime(s.startsAt)}–{formatTime(s.endsAt)}
        </p>
        <p className="text-sm text-muted">{s.place}</p>
        {s.note && <p className="text-sm text-muted whitespace-pre-line">{s.note}</p>}
        <ScriptLinks scripts={s.scripts} />
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <span
          className={`text-sm font-medium ${full ? "text-accent" : "text-green-700 dark:text-green-400"}`}
        >
          {full
            ? "Plno"
            : `${free} ${free === 1 ? "volné místo" : free < 5 ? "volná místa" : "volných míst"} z ${s.capacity}`}
        </span>
        <Link
          href={`/termin/${s.id}`}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            full
              ? "border border-border text-muted"
              : "bg-accent text-accent-foreground hover:opacity-90"
          }`}
        >
          {full ? "Detail" : "Registrovat"}
        </Link>
      </div>
    </Card>
  );
}
