import { createHmac } from "node:crypto";
import { siteUrl } from "./site";

/** Stable secret key for the organisers' calendar feed, derived from ADMIN_SECRET (no DB row needed). */
export function orgFeedKey() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update("org-calendar-feed").digest("hex").slice(0, 32);
}

export function orgFeedUrl() {
  const key = orgFeedKey();
  return key ? `${siteUrl()}/admin/kalendar.ics?key=${key}` : null;
}
