"use client";

import { useState } from "react";
import type { ScriptLink } from "@/db/schema";
import type { Dict } from "@/i18n/dictionaries";
import { Button, inputClass } from "../ui";

type Row = ScriptLink & { key: number };

export function ScriptsFields({
  initial,
  errors,
  t,
}: {
  initial: ScriptLink[];
  errors?: string[];
  t: Dict["admin"]["form"];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.length ? initial : [{ name: "", url: "" }]).map((r, i) => ({ ...r, key: i })),
  );
  const [nextKey, setNextKey] = useState(rows.length);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{t.scripts}</p>
      <p className="text-xs text-muted">{t.scriptsHint}</p>
      {rows.map((row, i) => (
        <div key={row.key} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <input
            name="scriptName"
            defaultValue={row.name}
            placeholder={t.scriptNamePlaceholder}
            className={inputClass}
            aria-label={t.scriptNameLabel.replace("{n}", String(i + 1))}
          />
          <input
            name="scriptUrl"
            type="text"
            inputMode="url"
            defaultValue={row.url}
            placeholder="https://…"
            className={`${inputClass} ${errors?.length ? "border-accent" : ""}`}
            aria-label={t.scriptUrlLabel.replace("{n}", String(i + 1))}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}
            aria-label={t.removeScript}
          >
            ✕
          </Button>
        </div>
      ))}
      {errors?.map((e) => (
        <p key={e} className="text-sm font-medium text-accent">{e}</p>
      ))}
      <div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setRows((r) => [...r, { name: "", url: "", key: nextKey }]);
            setNextKey((k) => k + 1);
          }}
        >
          {t.addScript}
        </Button>
      </div>
    </div>
  );
}
