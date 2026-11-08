import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import config from "../config/index.js";

const databaseUrl = config.database_url;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

export const pool = new Pool({
  connectionString: databaseUrl
});

export const db = drizzle({ client: pool });