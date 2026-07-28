import { z } from "zod";

export const taskSchema = z
  .object({
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
    isAllDay: z.boolean().default(false),
    reminderMode: z.enum(["none", "at_time", "before_due"]).default("none"),
    reminderAt: z.string().optional(),
    reminderMinutesBefore: z.number().int().min(1).max(1440).optional(),
  })
  .refine((d) => !d.isAllDay || d.reminderMode === "none", {
    message: "У задачи на весь день не может быть личного напоминания",
    path: ["reminderMode"],
  })
  .refine((d) => d.reminderMode !== "at_time" || !!d.reminderAt, {
    message: "Укажите время напоминания",
    path: ["reminderAt"],
  })
  .refine((d) => d.reminderMode !== "before_due" || !!d.reminderMinutesBefore, {
    message: "Укажите, за сколько минут напомнить",
    path: ["reminderMinutesBefore"],
  })
  .refine((d) => d.reminderMode !== "before_due" || !!d.dueDate, {
    message: "Для этого режима напоминания нужен дедлайн",
    path: ["dueDate"],
  });

export type TaskInput = z.input<typeof taskSchema>;
