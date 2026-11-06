import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.join(process.cwd(), ".env")
});

const config = {
  port: Number(process.env.PORT ?? 4000),
  database_url: process.env.DATABASE_URL
};

export default config;