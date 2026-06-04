"use client";

import { motion } from "motion/react";
import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types";

const FREQ_LABEL: Record<string, string> = {
  daily: "Ежедневно",
  weekly: "Еженедельно",
  weekdays: "По дням",
};

interface HabitCardProps {
  habit: Habit & { completedToday?: boolean };
  onLog: () => void;
  onClick: () => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export function HabitCard({ habit, onLog, onClick, onEdit, onDelete }: HabitCardProps) {
  const done = habit.completedToday;

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 0 20px var(--color-primary-glow)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass p-5 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {habit.icon ? (
            <span className="text-base shrink-0">{habit.icon}</span>
          ) : (
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: habit.color ?? "var(--color-primary)" }}
            />
          )}
          <h3 className="font-semibold text-text text-sm truncate">{habit.title}</h3>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {/* Edit / delete — visible on hover */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
            className="opacity-0 group-hover:opacity-100 text-muted hover:text-primary transition-all p-1"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }}
            className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all p-1"
          >
            <Trash2 size={13} />
          </button>

          {/* Log button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); if (!done) onLog(); }}
            className={cn(
              "ml-1 transition-colors",
              done ? "text-success" : "text-muted hover:text-primary"
            )}
          >
            {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </motion.button>
        </div>
      </div>

      {habit.description && (
        <p className="text-xs text-muted mb-3 line-clamp-2">{habit.description}</p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted">
        <span>{FREQ_LABEL[habit.frequency] ?? habit.frequency}</span>
        {habit.targetPerWeek && <span>· {habit.targetPerWeek}×/нед</span>}
        {habit.weekdays?.length && (
          <span>· {habit.weekdays.length} дн/нед</span>
        )}
      </div>
    </motion.div>
  );
}
