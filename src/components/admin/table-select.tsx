"use client";

import { useRef, useTransition } from "react";
import { assignTableAction } from "@/app/actions/admin";

/** Per-player table picker that saves on change. */
export function TableSelect({
  registrationId,
  tableId,
  options,
  noneLabel,
}: {
  registrationId: number;
  tableId: number | null;
  options: { id: number; label: string }[];
  noneLabel: string;
}) {
  const [pending, start] = useTransition();
  const ref = useRef<HTMLSelectElement>(null);
  return (
    <select
      ref={ref}
      defaultValue={tableId ?? ""}
      disabled={pending}
      aria-label={noneLabel}
      onChange={(e) => {
        const v = e.target.value;
        start(() => assignTableAction(registrationId, v === "" ? null : Number(v)));
      }}
      className="rounded-md border border-border bg-card px-2 py-1 text-xs"
    >
      <option value="">{noneLabel}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  );
}
