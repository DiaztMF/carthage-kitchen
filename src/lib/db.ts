import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/postgres?search_path=carthage";

const isProduction = process.env.NODE_ENV === "production";

// Global cache for serverless environment to prevent connection exhaustion
const globalForDb = globalThis as unknown as {
  sql: postgres.Sql | undefined;
};

let sql: postgres.Sql | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

try {
  if (process.env.DATABASE_URL) {
    sql =
      globalForDb.sql ??
      postgres(connectionString, {
        max: isProduction ? 10 : 1,
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: false, // Recommended for Supabase transaction pooler (port 6543)
      });

    if (!isProduction) {
      globalForDb.sql = sql;
    }
    dbInstance = drizzle(sql, { schema });
  } else {
    // Graceful fallback dummy/null client for build-time or when DATABASE_URL is missing
    const dummyClient = postgres(connectionString, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 2,
      prepare: false,
    });
    dbInstance = drizzle(dummyClient, { schema });
  }
} catch (error) {
  console.warn("[DB] Failed to initialize database client, operating in fallback mode:", error);
}

export const db = dbInstance;
export { sql };
