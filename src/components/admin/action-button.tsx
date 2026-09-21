"use client";

import { useState, useTransition } from "react";
import type { SimpleResult } from "@/app/actions/admin";
import { Button } from "../ui";

/** Button that runs a server action and shows its one-line result next to it. */
export function ActionButton({
  action,
  label,
  pendingLabel = "Pracuji…",
  confirmText,
  variant = "secondary",
}: {
  action: () => Promise<SimpleResult>;
  label: string;
  pendingLabel?: string;
  confirmText?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const [result, setResult] = useState<SimpleResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={variant}
        disabled={pending}
        onClick={() => {
          if (confirmText && !confirm(confirmText)) return;
          start(async () => setResult(await action()));
        }}
      >
        {pending ? pendingLabel : label}
      </Button>
      {result?.message && (
        <span className={`text-xs ${result.ok ? "text-green-700 dark:text-green-400" : "text-accent"}`}>
          {result.message}
        </span>
      )}
    </span>
  );
}
