import { pool } from "../../db";
import { createTaskInput, createTaskOutput } from "./createTask";

export async function createTaskHandler(input: unknown) {
  const data = createTaskInput.parse(input);

  const { rows } = await pool.query(
    `
    INSERT INTO tasks (id, title, description, completed)
    VALUES ($1, $2, $3, false)
    RETURNING id, title, description, completed
    `,
    [data.id, data.title, data.description]
  );

  return createTaskOutput.parse(rows[0]);
}
