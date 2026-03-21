// Prisma config for Supabase PostgreSQL
// DATABASE_URL = pooler connection (port 6543) for runtime
// DIRECT_URL   = direct connection (port 5432) for migrations
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL for migrations (bypasses pgbouncer)
    // Falls back to DATABASE_URL if DIRECT_URL is not set
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
