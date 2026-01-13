import { z } from "zod";

export const listTasksInput = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional()
});

export const listTasksOutput = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      completed: z.boolean()
    })
  )
});