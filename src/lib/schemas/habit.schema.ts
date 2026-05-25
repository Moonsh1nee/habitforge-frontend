import { z } from "zod";

export const habitSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(100),
  description: z.string().optional(),
  frequency: z.string().default("daily"),
  targetCount: z.number().min(1).default(1),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type HabitInput = z.input<typeof habitSchema>;
