import dotenv from "dotenv";

dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL as string
};

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL not defined on .env");
}