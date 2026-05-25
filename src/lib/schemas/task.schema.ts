import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(200),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
});

export type TaskInput = z.input<typeof taskSchema>;
