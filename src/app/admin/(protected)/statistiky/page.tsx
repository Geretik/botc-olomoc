import Link from "next/link";
import { Card } from "@/components/ui";
import { pastSessionStats, regulars, totals } from "@/lib/stats";
import { formatDate } from "@/lib/time";

function pct(v: number | null) {
  return v === null ? "–" : `${Math.round(v * 100)} %`;
}

export default async function StatsPage() {
  const [t, past, top] = await Promise.all([totals(), pastSessionStats(), regulars()]);

  const tiles: [string, string | number][] = [
    ["Proběhlých večerů", t.pastSessions],
    ["Nadcházejících", t.upcomingSessions],
    ["Registrací na proběhlé", t.registrations],
    ["Různých hráčů", t.uniquePlayers],
    ["Průměrná obsazenost", pct(t.avgOccupancy)],
    ["Docházka (z označených)", pct(t.attendanceRate)],
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Statistiky</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <Card key={label} className="flex flex-col gap-1">
            <span className="text-xs text-muted">{label}</span>
            <span className="text-2xl font-bold">{value}</span>
          </Card>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Obsazenost proběhlých večerů</h2>
        {past.length === 0 && <p className="text-muted">Zatím žádný večer neproběhl.</p>}
        {past.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-border">
                  <th className="p-3">Termín</th>
                  <th className="p-3">Datum</th>
                  <th className="p-3 text-right">Přihlášeno</th>
                  <th className="p-3 text-right">Obsazenost</th>
                  <th className="p-3 text-right">Dorazilo</th>
                  <th className="p-3 text-right">Nováčci</th>
                </tr>
              </thead>
              <tbody>
                {past.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="p-3"><Link href={`/admin/termin/${s.id}`} className="hover:underline">{s.title}</Link></td>
                    <td className="p-3 whitespace-nowrap">{formatDate(s.startsAt)}</td>
                    <td className="p-3 text-right">{s.confirmed} / {s.capacity}</td>
                    <td className="p-3 text-right">{pct(Math.min(1, s.confirmed / s.capacity))}</td>
                    <td className="p-3 text-right">{s.marked ? `${s.attended} / ${s.marked}` : "–"}</td>
                    <td className="p-3 text-right">{s.newbies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Pravidelní hráči</h2>
        <p className="text-sm text-muted">Podle počtu proběhlých večerů, na které byli přihlášení.</p>
        {top.length === 0 && <p className="text-muted">Zatím nikdo.</p>}
        {top.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-border">
                  <th className="p-3">Přezdívka</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3 text-right">Večerů</th>
                  <th className="p-3 text-right">Dorazil</th>
                  <th className="p-3 text-right">Nedorazil</th>
                  <th className="p-3">Naposledy</th>
                </tr>
              </thead>
              <tbody>
                {top.map((r) => (
                  <tr key={r.email} className="border-b border-border last:border-0">
                    <td className="p-3">{r.nickname}</td>
                    <td className="p-3"><a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a></td>
                    <td className="p-3 text-right">{r.sessions}</td>
                    <td className="p-3 text-right">{r.attended}</td>
                    <td className="p-3 text-right">{r.noShow}</td>
                    <td className="p-3 whitespace-nowrap">{formatDate(r.lastAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
