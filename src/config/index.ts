import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  port: Number(process.env.PORT ?? 4000),
  database_url: process.env.DATABASE_URL!,
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
  jwt_access_secret: process.env.JWT_ACCESS_TOKEN_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_TOKEN_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN!,
};

export default config;
