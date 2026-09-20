"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/admin";
import type { FormState } from "@/lib/validation";
import { Alert, Button, Field, inputClass } from "../ui";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <Field label="Heslo" name="password">
        <input id="password" name="password" type="password" required autoFocus className={inputClass} />
      </Field>
      <Button type="submit" disabled={pending}>{pending ? "Ověřuji…" : "Přihlásit"}</Button>
    </form>
  );
}
