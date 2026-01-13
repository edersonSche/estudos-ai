
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listTasksInput, listTasksOutput } from "./tools/listTasks";
import { listTasksHandler } from "./tools/listTasks.handler";
import { createTaskInput, createTaskOutput } from "./tools/createTask";
import { completeTaskInput, completeTaskOutput } from "./tools/completeTask";
import { completeTaskHandler } from "./tools/completeTask.handler";
import { createTaskHandler } from "./tools/createTask.handler";

export function createMcpServer() {
  const server = new McpServer(
    {
      name: "tasks-mcp",
      version: "1.0.0",
    }
  );

  server.registerTool(
    'listTasks',
    {
        description: "Lista tarefas do sistema",
        inputSchema: listTasksInput,
        outputSchema: listTasksOutput,
    },
    async (params) => {
        const result = await listTasksHandler(params);
        return {
            content: [
                {
                    type: "text",
                    text: "Segue lista das tarefas"
                }
            ],
            structuredContent: result
        }        
    },
  );

  server.registerTool(
    'createTask',
    {
      description: 'Cria uma nova tarefa',
      inputSchema: createTaskInput,
      outputSchema: createTaskOutput,
    },
    async (params) => {
        const result = await createTaskHandler(params);
        return {
            content: [
                {
                    type: "text",
                    text: "Tarefa criada com sucesso"
                }
            ],
            structuredContent: result
        }        
    }
  );

  server.registerTool(
    'completeTask',
    {
      description: 'Marca uma tarefa como concluída',
      inputSchema: completeTaskInput,
      outputSchema: completeTaskOutput,
    },
    async (params) => {
        const result = await completeTaskHandler(params);
        return {
            content: [
                {
                    type: "text",
                    text: `Tarefa completada!`
                }
            ],
            structuredContent: result
        }        
    }
  );

  return server;
}

export async function startMcpServer() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
}
