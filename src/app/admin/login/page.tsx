import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Card } from "@/components/ui";
import { getDict } from "@/i18n/server";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const { t } = await getDict();
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">{t.admin.login.title}</h1>
      <Card>
        <LoginForm t={t.admin.login} />
      </Card>
    </div>
  );
}
