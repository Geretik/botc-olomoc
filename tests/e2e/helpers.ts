import { type Page, expect } from "@playwright/test";
import { Client } from "pg";
import { E2E } from "../../playwright.config";

export async function sql<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const c = new Client(E2E.databaseUrl);
  await c.connect();
  try {
    return (await c.query(text, params)).rows as T[];
  } finally {
    await c.end();
  }
}

export async function resetDb() {
  await sql("delete from registrations");
  await sql("delete from sessions");
}

export async function createSession(overrides: Partial<{ title: string; capacity: number; daysAhead: number }> = {}) {
  const daysAhead = overrides.daysAhead ?? 7;
  const start = new Date(Date.now() + daysAhead * 864e5);
  start.setUTCHours(17, 0, 0, 0);
  const end = new Date(start.getTime() + 4 * 36e5);
  const rows = await sql<{ id: number }>(
    "insert into sessions (title, starts_at, ends_at, place, capacity, note, scripts) values ($1,$2,$3,$4,$5,$6,$7) returning id",
    [overrides.title ?? "Herní večer", start.toISOString(), end.toISOString(), "Klubovna", overrides.capacity ?? 2, null, JSON.stringify([])],
  );
  return rows[0].id;
}

export async function adminLogin(page: Page) {
  await page.goto("/admin/login");
  await page.fill("#password", E2E.adminPassword);
  await page.click("main button[type=submit]");
  await page.waitForURL(/\/admin$/);
}

export async function register(
  page: Page,
  sessionId: number,
  data: { first?: string; last?: string; nick: string; email: string; arrival?: string },
) {
  await page.goto(`/termin/${sessionId}`);
  await page.fill("#firstName", data.first ?? "Test");
  await page.fill("#lastName", data.last ?? "Testovic");
  await page.fill("#nickname", data.nick);
  await page.fill("#email", data.email);
  if (data.arrival) await page.fill("#arrivalTime", data.arrival);
  await page.click("main form button[type=submit]");
  await expect(page.getByTestId("register-result")).toBeVisible({ timeout: 15000 });
  return page.locator("main").textContent().then((t) => t ?? "");
}
