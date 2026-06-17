"use client";

import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useLogHabit } from "@/lib/hooks/useHabits";
import { cn } from "@/lib/utils";
import type { HabitToday } from "@/types";

interface HabitProgressRingProps {
  habits: HabitToday[];
}

export function HabitProgressRing({ habits }: HabitProgressRingProps) {
  const logHabit = useLogHabit();
  const completed = habits.filter((h) => h.completed_today).length;
  const pct = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;

  if (habits.length === 0) {
    return (
      <GlassCard>
        <h3 className="font-semibold text-text mb-3">Привычки</h3>
        <p className="text-xs text-muted text-center py-4">Нет привычек на сегодня</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text">Привычки сегодня</h3>
        <span className="text-xs font-semibold tabular-nums" style={{ color: pct === 100 ? "var(--color-success)" : "var(--color-muted)" }}>
          {completed}/{habits.length}
        </span>
      </div>

      {/* Mini progress bar */}
      <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: pct === 100 ? "var(--color-success)" : "linear-gradient(90deg, #7c3aed, #06b6d4)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence>
          {habits.slice(0, 6).map((habit, i) => (
            <motion.button
              key={habit.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}
              onClick={() => !habit.completed_today && logHabit.mutate({ id: habit.id })}
              disabled={habit.completed_today}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all",
                habit.completed_today
                  ? "bg-success/10 border border-success/20"
                  : "bg-white/3 border border-white/5 hover:bg-white/8 hover:border-primary/30 active:scale-95"
              )}
            >
              <div className="relative">
                <span className="text-lg leading-none">
                  {habit.icon ?? "◯"}
                </span>
                {habit.completed_today && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-success rounded-full flex items-center justify-center"
                  >
                    <span className="text-[8px] text-white font-bold">✓</span>
                  </motion.div>
                )}
              </div>
              <span className={cn(
                "text-[9px] leading-tight text-center max-w-full truncate w-full",
                habit.completed_today ? "text-success" : "text-muted"
              )}>
                {habit.title}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {habits.length > 6 && (
        <p className="text-xs text-muted text-center mt-3">
          + ещё {habits.length - 6} привычек
        </p>
      )}
    </GlassCard>
  );
}
