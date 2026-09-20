import Link from "next/link";
import { getDict } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getDict();
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">{t.notFound.title}</h1>
      <Link href="/" className="hover:underline">{t.session.back}</Link>
    </div>
  );
}
