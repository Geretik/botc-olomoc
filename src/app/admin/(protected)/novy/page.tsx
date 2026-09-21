import { createSessionAction } from "@/app/actions/admin";
import { SessionForm } from "@/components/admin/session-form";
import { Card } from "@/components/ui";
import { discordConfigured } from "@/lib/discord";
import { getSessionWithCount } from "@/lib/queries";
import { dateToPragueLocal } from "@/lib/time";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const fromId = Number(from);
  const template = from && Number.isInteger(fromId) ? await getSessionWithCount(fromId) : null;
  // duplicated session: same details, one week later
  const week = 7 * 864e5;
  const defaults = template
    ? {
        startsAt: dateToPragueLocal(new Date(template.startsAt.getTime() + week)),
        endsAt: dateToPragueLocal(new Date(template.endsAt.getTime() + week)),
      }
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Nový termín</h1>
      {template && (
        <p className="text-sm text-muted">
          Předvyplněno podle termínu „{template.title}“, datum posunuté o týden. Uprav podle potřeby.
        </p>
      )}
      <Card>
        <SessionForm
          action={createSessionAction}
          mode="create"
          session={template ?? undefined}
          defaults={defaults}
          discordConfigured={discordConfigured()}
        />
      </Card>
    </div>
  );
}
