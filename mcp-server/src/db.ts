import { Pool } from "pg";
import { config } from "./config";

export const pool = new Pool({
  connectionString: config.databaseUrl
});

export async function testDbConnection() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("✅ Conectado ao Postgres");
  } finally {
    client.release();
  }
}
