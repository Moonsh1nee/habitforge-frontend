"use client";

import { motion } from "motion/react";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { GlassCard } from "@/components/shared/GlassCard";
import { useLogHabit } from "@/lib/hooks/useHabits";
import type { Habit } from "@/types";

interface HabitProgressRingProps {
  habits: (Habit & { completedToday: boolean })[];
}

export function HabitProgressRing({ habits }: HabitProgressRingProps) {
  const logHabit = useLogHabit();
  const completed = habits.filter((h) => h.completedToday).length;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text">Привычки сегодня</h3>
        <span className="text-xs text-muted">
          {completed}/{habits.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {habits.slice(0, 6).map((habit, i) => (
          <motion.button
            key={habit.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => !habit.completedToday && logHabit.mutate({ id: habit.id })}
            className="flex flex-col items-center gap-1.5 group"
            disabled={habit.completedToday}
          >
            <ProgressRing
              value={habit.completedToday ? 100 : 0}
              size={52}
              strokeWidth={4}
              color={habit.completedToday ? "var(--color-success)" : "var(--color-primary)"}
              label={habit.completedToday ? "✓" : "○"}
            />
            <span className="text-[10px] text-muted max-w-[52px] truncate text-center">
              {habit.name}
            </span>
          </motion.button>
        ))}
      </div>
    </GlassCard>
  );
}
