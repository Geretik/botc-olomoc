import { timingSafeEqual } from "node:crypto";
import { isAdmin } from "@/lib/admin-auth";
import { sendDueReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

function bearerOk(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return (
    header.length === expected.length &&
    timingSafeEqual(Buffer.from(header), Buffer.from(expected))
  );
}

/**
 * Sends the "game night is tomorrow" reminders. Called daily by Vercel Cron
 * (see vercel.json) with `Authorization: Bearer $CRON_SECRET`; a logged-in admin
 * can also open it in the browser.
 */
export async function GET(req: Request) {
  if (!bearerOk(req) && !(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }
  const result = await sendDueReminders();
  return Response.json(result);
}
