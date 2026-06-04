import { z } from "zod";

export const habitSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(100),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "weekdays"]).default("daily"),
  targetPerWeek: z.number().int().min(1).max(7).optional(),
  weekdays: z.array(z.number().int().min(1).max(7)).optional(),
  color: z.string().optional(),
  icon: z.string().max(2).optional(),
});

export type HabitInput = z.input<typeof habitSchema>;
