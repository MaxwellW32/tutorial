import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// One connection pool for the whole server process.
//
// In development Next.js re-runs this module whenever you edit a file. A plain `new Pool()`
// here would open a fresh set of connections on every save and eventually exhaust the
// database. Parking the pool on `globalThis` lets it survive those reloads.
const globalForDb = globalThis as unknown as { tutorialPool?: Pool };

const pool =
  globalForDb.tutorialPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.tutorialPool = pool;

/** The Drizzle client. Import it anywhere on the server: `import { db } from "@/db"`. */
export const db = drizzle(pool, { schema });

export type Db = typeof db;
