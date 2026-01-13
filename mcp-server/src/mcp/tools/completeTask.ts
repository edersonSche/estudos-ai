import { z } from "zod";

export const completeTaskInput = z.object({
  id: z.cuid2()
});

export const completeTaskOutput = z.object({
  id: z.cuid2(),
  completed: z.boolean()
});