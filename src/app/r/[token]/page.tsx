import Link from "next/link";
import { EditRegistrationForm } from "@/components/edit-registration-form";
import { Alert, Card } from "@/components/ui";
import { getDict } from "@/i18n/server";
import { getRegistrationByToken } from "@/lib/queries";
import { formatDate, formatTime } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function EditRegistrationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [reg, { locale, t }] = await Promise.all([getRegistrationByToken(token), getDict()]);

  if (!reg) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{t.edit.notFoundTitle}</h1>
        <Alert kind="error">{t.edit.notFoundBody}</Alert>
        <Link href="/" className="text-sm hover:underline">{t.session.back}</Link>
      </div>
    );
  }

  const s = reg.session;
  const past = s.endsAt < new Date();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-muted hover:underline">{t.session.back}</Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.edit.title}</h1>
        <p className="mt-2 font-medium">{s.title}</p>
        <p>
          <span aria-hidden className="mr-1.5">📅</span>
          {formatDate(s.startsAt, locale)}, {formatTime(s.startsAt, locale)}–{formatTime(s.endsAt, locale)}
        </p>
        <p className="text-muted">
          <span aria-hidden className="mr-1.5">📍</span>
          {s.place}
        </p>
      </div>
      <Card>
        {reg.status === "cancelled" ? (
          <Alert kind="info">
            {t.edit.cancelledInfo}
            <Link href={`/termin/${s.id}`} className="underline">{t.edit.registerAgain}</Link>.
          </Alert>
        ) : past ? (
          <Alert kind="info">{t.session.past}</Alert>
        ) : (
          <EditRegistrationForm
            registration={reg}
            defaultArrival={formatTime(s.startsAt, locale)}
            defaultDeparture={formatTime(s.endsAt, locale)}
            t={t.form}
          />
        )}
      </Card>
    </div>
  );
}
