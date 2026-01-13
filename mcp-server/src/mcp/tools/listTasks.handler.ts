import { pool } from "../../db";
import { listTasksInput, listTasksOutput } from "./listTasks";

export async function listTasksHandler(input: unknown) {
  const params = listTasksInput.parse(input);

  const query = `
    SELECT id, title, description, completed
    FROM tasks
    ${params.completed !== undefined ? "WHERE completed = $1" : ""}
  `;

  const values = params.completed !== undefined ? [params.completed] : [];

  const { rows } = await pool.query(query, values);

  return listTasksOutput.parse({
    tasks: rows
  });
}
