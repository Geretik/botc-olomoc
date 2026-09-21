import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { SetupForm } from "@/components/admin/setup-form";
import { Card } from "@/components/ui";
import { getDict } from "@/i18n/server";
import { isAdmin } from "@/lib/admin-auth";
import { countAdminUsers } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const [{ t }, users] = await Promise.all([getDict(), countAdminUsers()]);
  // no account yet → the first-run wizard, protected by ADMIN_PASSWORD
  const setup = users === 0;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">{setup ? t.admin.setup.title : t.admin.login.title}</h1>
      <Card>{setup ? <SetupForm t={t.admin.setup} /> : <LoginForm t={t.admin.login} />}</Card>
    </div>
  );
}
