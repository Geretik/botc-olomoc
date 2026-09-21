"use client";

import { useState } from "react";
import { Button } from "./ui";

/** Copies a ready-made announcement (or opens the native share sheet on phones). */
export function ShareButton({ text, url, title, label, copiedLabel }: { text: string; url: string; title: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={async () => {
        try {
          if (typeof navigator.share === "function" && /Mobi|Android/i.test(navigator.userAgent)) {
            await navigator.share({ title, text, url });
            return;
          }
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          /* cancelled or clipboard unavailable */
        }
      }}
    >
      {copied ? copiedLabel : `🔗 ${label}`}
    </Button>
  );
}
