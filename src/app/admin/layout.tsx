import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/admin";
import { Button } from "@/components/ui";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  const pathname = (await headers()).get("x-pathname");
  // login page renders without the admin chrome
  if (!admin) {
    if (pathname !== "/admin/login") redirect("/admin/login");
    return children;
  }
  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap items-center gap-3 border-b border-border pb-3 text-sm">
        <Link href="/admin" className="font-semibold">Admin</Link>
        <Link href="/admin/novy" className="hover:underline">+ Nový termín</Link>
        <form action={logoutAction} className="ml-auto">
          <Button type="submit" variant="secondary">Odhlásit</Button>
        </form>
      </nav>
      {children}
    </div>
  );
}
