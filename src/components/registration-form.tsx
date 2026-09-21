"use client";

import { useActionState } from "react";
import { registerAction, type RegisterResult } from "@/app/actions/registration";
import type { Dict } from "@/i18n/dictionaries";
import { TimeSelect } from "./time-select";
import { Alert, Button, Checkbox, Field, inputClass } from "./ui";

export function RegistrationForm({
  sessionId,
  defaultArrival,
  defaultDeparture,
  waitlist = false,
  t,
}: {
  sessionId: number;
  defaultArrival: string;
  defaultDeparture: string;
  /** true when the session is full and the player joins the waitlist */
  waitlist?: boolean;
  t: Dict["form"];
}) {
  const [state, action, pending] = useActionState<RegisterResult, FormData>(
    registerAction.bind(null, sessionId),
    {},
  );

  if (state.ok) {
    return (
      <div className="flex flex-col gap-3" data-testid="register-result">
        <Alert kind="success">
          {state.outcome === "already_registered" ? (
            <>
              <strong>{t.alreadyTitle}</strong>
              {state.emailThrottled ? t.alreadyBodyRecent : t.alreadyBody}
            </>
          ) : state.outcome === "waitlisted" ? (
            <>
              <strong>{t.waitlistSuccessTitle.replace("{n}", String(state.position ?? 1))}</strong>
              {t.waitlistSuccessBody}
            </>
          ) : (
            <>
              <strong>{t.successTitle}</strong>
              {t.successBody}
            </>
          )}
        </Alert>
        {state.emailFailed && <Alert kind="error">{t.emailFailed}</Alert>}
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.firstName} name="firstName" errors={fe.firstName}>
          <input id="firstName" name="firstName" required className={inputClass} autoComplete="given-name" />
        </Field>
        <Field label={t.lastName} name="lastName" errors={fe.lastName}>
          <input id="lastName" name="lastName" required className={inputClass} autoComplete="family-name" />
        </Field>
      </div>
      <Field label={t.nickname} name="nickname" errors={fe.nickname} hint={t.nicknameHint}>
        <input id="nickname" name="nickname" required className={inputClass} autoComplete="nickname" />
      </Field>
      <Field label={t.email} name="email" errors={fe.email} hint={t.emailHint}>
        <input id="email" name="email" type="email" required className={inputClass} autoComplete="email" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.arrival} name="arrivalTime" errors={fe.arrivalTime} hint={t.arrivalHint}>
          <TimeSelect
            id="arrivalTime"
            name="arrivalTime"
            start={defaultArrival}
            end={defaultDeparture}
            defaultLabel={t.arrivalDefault.replace("{t}", defaultArrival)}
          />
        </Field>
        <Field label={t.departure} name="departureTime" errors={fe.departureTime} hint={t.departureHint}>
          <TimeSelect
            id="departureTime"
            name="departureTime"
            start={defaultArrival}
            end={defaultDeparture}
            defaultLabel={t.departureDefault.replace("{t}", defaultDeparture)}
          />
        </Field>
      </div>
      <Checkbox name="canStorytell" label={t.canStorytell} hint={t.canStorytellHint} />
      <Checkbox name="isNewbie" label={t.isNewbie} hint={t.isNewbieHint} />
      <Field label={t.note} name="note" errors={fe.note} hint={t.noteHint}>
        <textarea id="note" name="note" rows={2} maxLength={500} className={inputClass} />
      </Field>
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? t.submitting : waitlist ? t.submitWaitlist : t.submit}
      </Button>
    </form>
  );
}
