"use client";

import { motion } from "motion/react";
import { Flame, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types";

interface HabitCardProps {
  habit: Habit & { completedToday?: boolean };
  onLog: () => void;
  onClick: () => void;
}

export function HabitCard({ habit, onLog, onClick }: HabitCardProps) {
  const done = habit.completedToday;

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 0 20px var(--color-primary-glow)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass p-5 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: habit.color ?? "var(--color-primary)" }}
          />
          <h3 className="font-semibold text-text text-sm">{habit.name}</h3>
        </div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            if (!done) onLog();
          }}
          className={cn(
            "flex-shrink-0 transition-colors",
            done ? "text-success" : "text-muted hover:text-primary"
          )}
        >
          {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </motion.button>
      </div>

      {habit.description && (
        <p className="text-xs text-muted mb-3 line-clamp-2">{habit.description}</p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-warning">
        <Flame size={12} />
        <span>{habit.streak ?? 0} дней подряд</span>
      </div>
    </motion.div>
  );
}
