"use client";

import { useActionState } from "react";
import { broadcastEmailAction, type BroadcastResult } from "@/app/actions/admin";
import { Alert, Button, Checkbox, Field, inputClass } from "../ui";

export function BroadcastForm({
  sessionId,
  confirmedCount,
  waitlistedCount,
}: {
  sessionId: number;
  confirmedCount: number;
  waitlistedCount: number;
}) {
  const [state, action, pending] = useActionState<BroadcastResult, FormData>(
    broadcastEmailAction.bind(null, sessionId),
    {},
  );
  const fe = state.fieldErrors ?? {};
  return (
    <form
      action={action}
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        if (!confirm("Odeslat e-mail všem přihlášeným?")) e.preventDefault();
      }}
    >
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.ok && (
        <Alert kind={state.failed ? "error" : "success"}>
          Odesláno {state.sent} e-mailů{state.failed ? `, ${state.failed} selhalo` : ""}.
        </Alert>
      )}
      <Field label="Předmět" name="subject" errors={fe.subject}>
        <input id="subject" name="subject" required maxLength={200} className={inputClass} placeholder="Změna místa konání" />
      </Field>
      <Field label="Zpráva" name="message" errors={fe.message} hint="Každý hráč dostane e-mail zvlášť, s oslovením a odkazem na svou registraci v patičce.">
        <textarea id="message" name="message" required rows={5} maxLength={5000} className={inputClass} />
      </Field>
      <Checkbox
        name="includeWaitlist"
        label={`Poslat i náhradníkům (${waitlistedCount})`}
        defaultChecked={false}
      />
      <Button type="submit" disabled={pending || confirmedCount + waitlistedCount === 0}>
        {pending ? "Odesílám…" : `Odeslat ${confirmedCount} přihlášeným`}
      </Button>
    </form>
  );
}
