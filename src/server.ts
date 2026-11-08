

import { sql } from "drizzle-orm";

import app from "./app.js";
import config from "./config/index.js";
import { db, pool } from "./db/index.js";

const PORT = config.port;

async function main() {
  try {
    await db.execute(sql`SELECT 1`);

    console.log("Connected to the database successfully.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);

    await pool.end();
    process.exitCode = 1;
  }
}

void main();