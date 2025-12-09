import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("DATABASE_URL not set - database operations will fail");
}

// Create pool with fallback for when DATABASE_URL is not set
const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : null as any; // In dev mode without DB, operations will fail at runtime

export const db = pool ? drizzle(pool, { schema }) : null as any;
