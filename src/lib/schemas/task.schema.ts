import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(200),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(4).default(2),
  dueDate: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrence: z.string().optional(),
});

export type TaskInput = z.input<typeof taskSchema>;
