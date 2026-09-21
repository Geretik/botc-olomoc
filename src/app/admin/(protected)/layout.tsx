import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/admin";
import { Button } from "@/components/ui";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// The login page lives outside this route group, so it is never wrapped by
// this layout and the redirect below cannot loop.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap items-center gap-3 border-b border-border pb-3 text-sm">
        <Link href="/admin" className="font-semibold">Admin</Link>
        <Link href="/admin/novy" className="hover:underline">+ Nový termín</Link>
        <Link href="/admin/statistiky" className="hover:underline">Statistiky</Link>
        <form action={logoutAction} className="ml-auto">
          <Button type="submit" variant="secondary">Odhlásit</Button>
        </form>
      </nav>
      {children}
    </div>
  );
}
