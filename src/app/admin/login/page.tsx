import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { SetupForm } from "@/components/admin/setup-form";
import { Alert, Card } from "@/components/ui";
import { getDict } from "@/i18n/server";
import { isAdmin } from "@/lib/admin-auth";
import { countAdminUsers } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const [{ t }, users] = await Promise.all([getDict(), countAdminUsers()]);
  // no account yet → the first-run wizard, protected by ADMIN_PASSWORD
  const setup = users === 0;
  const bootstrapMissing = setup && !(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);
  // Diagnostic hint for the wizard only: the length and a short fingerprint of the server password,
  // so a typo or an invisible character can be spotted without revealing the value.
  const bootstrapHint =
    setup && process.env.ADMIN_PASSWORD
      ? `${process.env.ADMIN_PASSWORD.length} / ${createHash("sha256").update(process.env.ADMIN_PASSWORD).digest("hex").slice(0, 6)}`
      : null;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">{setup ? t.admin.setup.title : t.admin.login.title}</h1>
      {bootstrapMissing && <Alert kind="error">{t.admin.setup.bootstrapMissing}</Alert>}
      {bootstrapHint && (
        <p className="mb-3 text-xs text-muted">{t.admin.setup.bootstrapHint}: {bootstrapHint}</p>
      )}
      <Card>{setup ? <SetupForm t={t.admin.setup} /> : <LoginForm t={t.admin.login} />}</Card>
    </div>
  );
}
