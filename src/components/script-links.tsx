import type { ScriptLink } from "@/db/schema";

export function ScriptLinks({ scripts, className = "" }: { scripts: ScriptLink[]; className?: string }) {
  if (!scripts.length) return null;
  return (
    <p className={`text-sm ${className}`}>
      <span className="text-muted">{scripts.length === 1 ? "Script: " : "Scripty: "}</span>
      {scripts.map((s, i) => (
        <span key={s.url}>
          {i > 0 && <span className="text-muted">, </span>}
          <a href={s.url} target="_blank" rel="noreferrer" className="underline hover:text-accent">
            {s.name}
          </a>
        </span>
      ))}
    </p>
  );
}
