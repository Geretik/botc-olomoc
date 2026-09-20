import { createSessionAction } from "@/app/actions/admin";
import { SessionForm } from "@/components/admin/session-form";
import { Card } from "@/components/ui";

export default function NewSessionPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Nový termín</h1>
      <Card>
        <SessionForm action={createSessionAction} />
      </Card>
    </div>
  );
}
