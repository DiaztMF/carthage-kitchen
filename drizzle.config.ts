import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["carthage"],
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgres://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?search_path=carthage",
  },
});
