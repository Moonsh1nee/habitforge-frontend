import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(200),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(3).default(2),
  status: z.enum(["todo", "in_progress", "review", "done", "cancelled"]).default("todo"),
  icon: z.string().max(10).optional(),
  coverColor: z.string().optional(),
  estimatedMinutes: z.number().int().min(1).optional(),
  dueDate: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrence: z.string().optional(),
  projectId: z.string().optional(),
});

export type TaskInput = z.input<typeof taskSchema>;
