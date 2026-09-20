"use client";

import { useActionState } from "react";
import { registerAction, type RegisterResult } from "@/app/actions/registration";
import { Alert, Button, Field, inputClass } from "./ui";

export function RegistrationForm({
  sessionId,
  defaultArrival,
  defaultDeparture,
}: {
  sessionId: number;
  defaultArrival: string;
  defaultDeparture: string;
}) {
  const [state, action, pending] = useActionState<RegisterResult, FormData>(
    registerAction.bind(null, sessionId),
    {},
  );

  if (state.ok) {
    return (
      <div className="flex flex-col gap-3">
      <Alert kind="success">
        {state.outcome === "already_registered" ? (
          <>
            <strong>S tímto e-mailem už jsi registrovaný/á.</strong> Poslali jsme ti
            znovu odkaz na úpravu registrace.
          </>
        ) : (
          <>
            <strong>Hotovo, jsi registrovaný/á!</strong> Na e-mail ti přišlo potvrzení
            s odkazem, kde můžeš registraci upravit nebo zrušit.
          </>
        )}
      </Alert>
      {state.emailFailed && (
        <Alert kind="error">
          Registrace je uložená, ale potvrzovací e-mail se nepodařilo odeslat.
          Napiš prosím organizátorům, pošlou ti odkaz na úpravu ručně.
        </Alert>
      )}
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Jméno" name="firstName" errors={fe.firstName}>
          <input id="firstName" name="firstName" required className={inputClass} autoComplete="given-name" />
        </Field>
        <Field label="Příjmení" name="lastName" errors={fe.lastName}>
          <input id="lastName" name="lastName" required className={inputClass} autoComplete="family-name" />
        </Field>
      </div>
      <Field label="Přezdívka" name="nickname" errors={fe.nickname} hint="Jak ti říkají u stolu. Přezdívka bude zobrazena na webu v seznamu přihlášených, ostatní údaje vidí jen organizátoři.">
        <input id="nickname" name="nickname" required className={inputClass} autoComplete="nickname" />
      </Field>
      <Field label="E-mail" name="email" errors={fe.email} hint="Pošleme ti potvrzení a odkaz na úpravu.">
        <input id="email" name="email" type="email" required className={inputClass} autoComplete="email" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Příchod" name="arrivalTime" errors={fe.arrivalTime} hint="Nech prázdné, pokud přijdeš na začátek.">
          <input id="arrivalTime" name="arrivalTime" type="time" className={inputClass} placeholder={defaultArrival} />
        </Field>
        <Field label="Odchod" name="departureTime" errors={fe.departureTime} hint="Nech prázdné, pokud zůstaneš do konce.">
          <input id="departureTime" name="departureTime" type="time" className={inputClass} placeholder={defaultDeparture} />
        </Field>
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Odesílám…" : "Registrovat"}
      </Button>
    </form>
  );
}
