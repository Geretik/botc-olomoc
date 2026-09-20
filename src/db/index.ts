import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  // pg treats sslmode=require as verify-full anyway; say so explicitly to silence its warning
  return url.replace(/sslmode=(require|prefer|verify-ca)/, "sslmode=verify-full");
}

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: connectionString(),
    max: 5,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
