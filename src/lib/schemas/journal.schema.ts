import { z } from "zod";

export const journalEntrySchema = z.object({
  date: z.string().optional(),
  mood: z.number().min(1).max(10).optional(),
  energy: z.number().min(1).max(10).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().min(1).max(10).optional(),
  weight: z.number().positive().optional(),
  notes: z.string().optional(),
  wins: z.string().optional(),
  improvements: z.string().optional(),
});

export type JournalEntryInput = z.input<typeof journalEntrySchema>;
