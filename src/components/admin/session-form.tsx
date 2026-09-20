"use client";

import { useActionState } from "react";
import type { Session } from "@/db/schema";
import type { FormState } from "@/lib/validation";
import { Alert, Button, Field, inputClass } from "../ui";

export function SessionForm({
  action: serverAction,
  session,
  defaults,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  session?: Session;
  /** datetime-local strings in Prague time */
  defaults?: { startsAt: string; endsAt: string };
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(serverAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.ok && <Alert kind="success">Uloženo.</Alert>}
      <Field label="Název" name="title" errors={fe.title}>
        <input id="title" name="title" required defaultValue={session?.title ?? ""} className={inputClass} placeholder="Herní večer #12" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Začátek" name="startsAt" errors={fe.startsAt}>
          <input id="startsAt" name="startsAt" type="datetime-local" required defaultValue={defaults?.startsAt ?? ""} className={inputClass} />
        </Field>
        <Field label="Konec" name="endsAt" errors={fe.endsAt}>
          <input id="endsAt" name="endsAt" type="datetime-local" required defaultValue={defaults?.endsAt ?? ""} className={inputClass} />
        </Field>
      </div>
      <Field label="Místo" name="place" errors={fe.place}>
        <input id="place" name="place" required defaultValue={session?.place ?? ""} className={inputClass} />
      </Field>
      <Field label="Kapacita" name="capacity" errors={fe.capacity}>
        <input id="capacity" name="capacity" type="number" min={1} max={500} required defaultValue={session?.capacity ?? 15} className={inputClass} />
      </Field>
      <Field label="Poznámka" name="note" errors={fe.note} hint="Volitelné, např. scénář nebo co přinést.">
        <textarea id="note" name="note" rows={3} defaultValue={session?.note ?? ""} className={inputClass} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Ukládám…" : session ? "Uložit změny" : "Vytvořit termín"}
      </Button>
    </form>
  );
}
