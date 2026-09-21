import { redirect } from "next/navigation";
import { InviteAcceptForm } from "@/components/admin/invite-accept-form";
import { Alert, Card } from "@/components/ui";
import { getDict } from "@/i18n/server";
import { isAdmin } from "@/lib/admin-auth";
import { getOpenInvite } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

/** Public page behind a one-time invitation link: the invitee creates their own account here. */
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (await isAdmin()) redirect("/admin");
  const [{ t }, invite] = await Promise.all([getDict(), getOpenInvite(token)]);
  const a = t.admin.invite;
  if (!invite) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="mb-4 text-2xl font-bold">{a.invalidTitle}</h1>
        <Alert kind="error">{a.invalidBody}</Alert>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">{a.title}</h1>
      <Card>
        <p className="mb-4 text-sm text-muted">
          {a.intro.replace("{site}", t.meta.title)} {a.role}: <strong>{t.admin.roles[invite.role]}</strong>.
        </p>
        <InviteAcceptForm token={token} t={a} />
      </Card>
    </div>
  );
}
