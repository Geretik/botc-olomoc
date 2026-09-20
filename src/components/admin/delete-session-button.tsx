"use client";

import { Button } from "../ui";

export function DeleteSessionButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Smazat termín včetně všech registrací? Tuto akci nelze vrátit.")) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="danger">Smazat termín</Button>
    </form>
  );
}
