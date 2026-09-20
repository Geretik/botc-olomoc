"use client";

import { useActionState, useState } from "react";
import {
  cancelRegistrationAction,
  updateRegistrationAction,
} from "@/app/actions/registration";
import type { Registration } from "@/db/schema";
import type { FormState } from "@/lib/validation";
import { Alert, Button, Field, inputClass } from "./ui";

export function EditRegistrationForm({
  registration: r,
  defaultArrival,
  defaultDeparture,
}: {
  registration: Registration;
  defaultArrival: string;
  defaultDeparture: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateRegistrationAction.bind(null, r.editToken),
    {},
  );
  const [cancelState, setCancelState] = useState<FormState | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function onCancel() {
    if (!confirm("Opravdu chceš registraci zrušit?")) return;
    setCancelling(true);
    const res = await cancelRegistrationAction(r.editToken);
    setCancelState(res);
    setCancelling(false);
  }

  if (cancelState?.ok) {
    return (
      <Alert kind="success">
        Registrace byla zrušena. Pokud si to rozmyslíš, můžeš se registrovat znovu.
      </Alert>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-4">
        {state.error && <Alert kind="error">{state.error}</Alert>}
        {state.ok && <Alert kind="success">Změny uloženy.</Alert>}
        {cancelState?.error && <Alert kind="error">{cancelState.error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jméno" name="firstName" errors={fe.firstName}>
            <input id="firstName" name="firstName" required defaultValue={r.firstName} className={inputClass} />
          </Field>
          <Field label="Příjmení" name="lastName" errors={fe.lastName}>
            <input id="lastName" name="lastName" required defaultValue={r.lastName} className={inputClass} />
          </Field>
        </div>
        <Field label="Přezdívka" name="nickname" errors={fe.nickname} hint="Bude zobrazena na webu v seznamu přihlášených.">
          <input id="nickname" name="nickname" required defaultValue={r.nickname} className={inputClass} />
        </Field>
        <Field label="E-mail" name="email">
          <input id="email" value={r.email} disabled className={`${inputClass} opacity-60`} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Příchod" name="arrivalTime" errors={fe.arrivalTime} hint={`Prázdné = ${defaultArrival}`}>
            <input id="arrivalTime" name="arrivalTime" type="time" defaultValue={r.arrivalTime ?? ""} className={inputClass} />
          </Field>
          <Field label="Odchod" name="departureTime" errors={fe.departureTime} hint={`Prázdné = ${defaultDeparture}`}>
            <input id="departureTime" name="departureTime" type="time" defaultValue={r.departureTime ?? ""} className={inputClass} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Ukládám…" : "Uložit změny"}
          </Button>
          <Button type="button" variant="danger" onClick={onCancel} disabled={cancelling}>
            {cancelling ? "Ruším…" : "Zrušit registraci"}
          </Button>
        </div>
      </form>
    </div>
  );
}
