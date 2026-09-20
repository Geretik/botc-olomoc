import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Card } from "@/components/ui";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Přihlášení do adminu</h1>
      <Card>
        <LoginForm />
      </Card>
    </div>
  );
}
