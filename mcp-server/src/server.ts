import { testDbConnection } from "./db";
import { startMcpServer } from "./mcp/server";

async function start() {
  console.log("🔧 Iniciando MCP Server...");
  await testDbConnection();
  await startMcpServer();
}

start().catch(err => {
  console.error("❌ Erro ao iniciar", err);
  process.exit(1);
});
