import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">Stránka nenalezena</h1>
      <Link href="/" className="hover:underline">← Zpět na termíny</Link>
    </div>
  );
}
