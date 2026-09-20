import Link from "next/link";
import { EditRegistrationForm } from "@/components/edit-registration-form";
import { Alert, Card } from "@/components/ui";
import { getRegistrationByToken } from "@/lib/queries";
import { formatDate, formatTime } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function EditRegistrationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const reg = await getRegistrationByToken(token);

  if (!reg) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Registrace nenalezena</h1>
        <Alert kind="error">
          Tento odkaz je neplatný. Zkontroluj, zda jsi ho zkopíroval/a celý.
        </Alert>
        <Link href="/" className="text-sm hover:underline">← Zpět na termíny</Link>
      </div>
    );
  }

  const s = reg.session;
  const past = s.endsAt < new Date();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-muted hover:underline">← Zpět na termíny</Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tvoje registrace</h1>
        <p className="mt-2 font-medium">{s.title}</p>
        <p>
          <span>{formatDate(s.startsAt)}</span>,{" "}
          {formatTime(s.startsAt)}–{formatTime(s.endsAt)}
        </p>
        <p className="text-muted">{s.place}</p>
      </div>
      <Card>
        {reg.status === "cancelled" ? (
          <Alert kind="info">
            Tato registrace je zrušená. Pokud chceš přijít,{" "}
            <Link href={`/termin/${s.id}`} className="underline">registruj se znovu</Link>.
          </Alert>
        ) : past ? (
          <Alert kind="info">Tento termín už proběhl.</Alert>
        ) : (
          <EditRegistrationForm
            registration={reg}
            defaultArrival={formatTime(s.startsAt)}
            defaultDeparture={formatTime(s.endsAt)}
          />
        )}
      </Card>
    </div>
  );
}
