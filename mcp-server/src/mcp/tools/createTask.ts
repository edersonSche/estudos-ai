import { z } from "zod";
import { createId } from '@paralleldrive/cuid2'

export const createTaskInput = z.object({
  id: z.cuid2().default(() => createId()),
  title: z.string().min(3),
  description: z.string()
});

export const createTaskOutput = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean()
});
