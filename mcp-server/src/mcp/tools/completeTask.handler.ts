import { pool } from "../../db";
import { McpError } from "../errors";
import { completeTaskInput, completeTaskOutput } from "./completeTask";

export async function completeTaskHandler(input: unknown) {
  const { id } = completeTaskInput.parse(input);

  const { rows } = await pool.query(
    `
    UPDATE tasks
    SET completed = true
    WHERE id = $1
    RETURNING id, completed
    `,
    [id]
  );

  if (!rows.length) {
    throw new McpError("TASk_NOT_FOUND", "Tarefa não encontrada");
  }

  return completeTaskOutput.parse(rows[0]);
}
