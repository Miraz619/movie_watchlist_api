

import bcrypt from "bcryptjs";
import config from "../config/index.js";
import { db, pool } from "./index.js";
import { users } from "./schema/users.js";

const seedAdmin = async () => {
  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD!,
    config.bcrypt_salt_rounds,
  );

  await db.insert(users).values({
    name: process.env.ADMIN_NAME!,
    email: process.env.ADMIN_EMAIL!,
    passwordHash,
    role: "admin",
  });

  console.log("Admin created");
};

seedAdmin()
  .catch(() => {
    console.error("Admin seed failed");
    process.exitCode = 1;
  })
  .finally(() => pool.end());