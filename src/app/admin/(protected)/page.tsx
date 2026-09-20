import Link from "next/link";
import { Card } from "@/components/ui";
import { listAllSessions } from "@/lib/queries";
import { formatDate, formatTime } from "@/lib/time";

export default async function AdminHomePage() {
  const sessions = await listAllSessions();
  const now = new Date();
  const upcoming = sessions.filter((s) => s.endsAt >= now);
  const past = sessions.filter((s) => s.endsAt < now).reverse();

  const Row = ({ s }: { s: (typeof sessions)[number] }) => (
    <Link href={`/admin/termin/${s.id}`} className="block">
      <Card className="flex flex-col gap-1 hover:border-accent/50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{s.title}</p>
          <p className="text-sm text-muted">
            <span>{formatDate(s.startsAt)}</span>, {formatTime(s.startsAt)} – {formatTime(s.endsAt)} · {s.place}
          </p>
        </div>
        <p className="text-sm font-medium">
          {s.confirmedCount} / {s.capacity}
        </p>
      </Card>
    </Link>
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Nadcházející termíny</h1>
        {upcoming.length === 0 && <p className="text-muted">Žádné. <Link href="/admin/novy" className="underline">Vypsat nový</Link>.</p>}
        {upcoming.map((s) => <Row key={s.id} s={s} />)}
      </section>
      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-muted">Proběhlé</h2>
          {past.map((s) => <Row key={s.id} s={s} />)}
        </section>
      )}
    </div>
  );
}
