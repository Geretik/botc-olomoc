"use client";

import { useActionState, useState } from "react";
import { addGameAction } from "@/app/actions/admin";
import type { ScriptLink } from "@/db/schema";
import type { FormState } from "@/lib/validation";
import { Alert, Button, Field, inputClass } from "../ui";

type Labels = {
  gameScript: string;
  gameScriptCustom: string;
  gameWinner: string;
  gameWinnerUnknown: string;
  gameWinnerGood: string;
  gameWinnerEvil: string;
  gamePlayers: string;
  gameNotes: string;
  gameAdd: string;
  gameAdding: string;
};

/** Records one played game; the script can be picked from the session's list or typed. */
export function GameForm({ sessionId, scripts, t }: { sessionId: number; scripts: ScriptLink[]; t: Labels }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addGameAction.bind(null, sessionId), {});
  const [pick, setPick] = useState(scripts[0]?.name ?? "__custom");
  const fe = state.fieldErrors ?? {};
  const chosen = scripts.find((s) => s.name === pick);
  return (
    <form action={action} className="flex flex-col gap-3">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <Field label={t.gameScript} name="scriptPick" errors={fe.scriptName}>
          <select id="scriptPick" value={pick} onChange={(e) => setPick(e.target.value)} className={inputClass}>
            {scripts.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
            <option value="__custom">{t.gameScriptCustom}</option>
          </select>
          {pick === "__custom" ? (
            <input name="scriptName" required maxLength={200} className={`${inputClass} mt-2`} placeholder="Trouble Brewing" />
          ) : (
            <>
              <input type="hidden" name="scriptName" value={chosen?.name ?? ""} />
              <input type="hidden" name="scriptUrl" value={chosen?.url ?? ""} />
            </>
          )}
        </Field>
        <Field label={t.gameWinner} name="winner" errors={fe.winner}>
          <select id="winner" name="winner" defaultValue="" className={inputClass}>
            <option value="">{t.gameWinnerUnknown}</option>
            <option value="good">{t.gameWinnerGood}</option>
            <option value="evil">{t.gameWinnerEvil}</option>
          </select>
        </Field>
        <Field label={t.gamePlayers} name="players" errors={fe.players}>
          <input id="players" name="players" type="number" min={5} max={20} className={inputClass} />
        </Field>
      </div>
      <Field label={t.gameNotes} name="notes" errors={fe.notes}>
        <input id="notes" name="notes" maxLength={1000} className={inputClass} />
      </Field>
      <div>
        <Button type="submit" variant="secondary" disabled={pending}>{pending ? t.gameAdding : t.gameAdd}</Button>
      </div>
    </form>
  );
}
