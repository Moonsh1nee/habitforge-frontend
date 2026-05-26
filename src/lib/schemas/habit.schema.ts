import { z } from "zod";

export const habitSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(100),
  description: z.string().optional(),
  frequency: z.string().default("daily"),
  targetPerWeek: z.number().min(1).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type HabitInput = z.input<typeof habitSchema>;
