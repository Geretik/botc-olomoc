"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/admin";
import type { Dict } from "@/i18n/dictionaries";
import type { FormState } from "@/lib/validation";
import { Alert, Button, Field, inputClass } from "../ui";

export function LoginForm({ t }: { t: Dict["admin"]["login"] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <Field label={t.password} name="password">
        <input id="password" name="password" type="password" required autoFocus className={inputClass} />
      </Field>
      <Button type="submit" disabled={pending}>{pending ? t.checking : t.submit}</Button>
    </form>
  );
}
