import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/admin";
import { Button } from "@/components/ui";
import { getDict } from "@/i18n/server";
import { getAdmin, hasRole } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// The login and invitation pages live outside this route group, so they are never
// wrapped by this layout and the redirect below cannot loop.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getAdmin();
  if (!me) redirect("/admin/login");
  const { t } = await getDict();
  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap items-center gap-3 border-b border-border pb-3 text-sm">
        <Link href="/admin" className="font-semibold">{t.admin.nav.home}</Link>
        <Link href="/admin/novy" className="hover:underline">{t.admin.nav.newSession}</Link>
        <Link href="/admin/statistiky" className="hover:underline">{t.admin.nav.stats}</Link>
        {hasRole(me, "admin") && <Link href="/admin/ucty" className="hover:underline">{t.admin.nav.accounts}</Link>}
        <span className="ml-auto text-muted" title={me.email}>{me.nickname}</span>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary">{t.admin.nav.logout}</Button>
        </form>
      </nav>
      {children}
    </div>
  );
}
