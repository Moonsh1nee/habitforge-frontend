"use client";

import { motion, AnimatePresence } from "motion/react";
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
  const color = habit.color ?? "#7c3aed";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "glass p-5 cursor-pointer group border-l-2 transition-all duration-300",
        done ? "border-l-success/70 bg-success/3" : "border-l-transparent hover:border-l-primary/50"
      )}
      style={done ? {} : { "--tw-border-opacity": 1 } as React.CSSProperties}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Icon or color dot */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base transition-all"
            style={{ background: `${color}20`, border: `1px solid ${color}30` }}
          >
            {habit.icon ? (
              <span>{habit.icon}</span>
            ) : (
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            )}
          </div>
          <h3 className="font-semibold text-text text-sm truncate">{habit.title}</h3>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
            className="opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 text-muted hover:text-primary transition-all p-1 rounded"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }}
            className="opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 text-muted hover:text-danger transition-all p-1 rounded"
          >
            <Trash2 size={13} />
          </button>

          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); if (!done) onLog(); }}
            className={cn(
              "ml-1.5 transition-all",
              done ? "text-success" : "text-muted hover:text-primary"
            )}
          >
            <AnimatePresence mode="wait">
              {done ? (
                <motion.span
                  key="done"
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <CheckCircle2 size={20} />
                </motion.span>
              ) : (
                <motion.span key="todo" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <Circle size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {habit.description && (
        <p className="text-xs text-muted mb-3 line-clamp-2">{habit.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>{FREQ_LABEL[habit.frequency] ?? habit.frequency}</span>
          {habit.targetPerWeek && <span>· {habit.targetPerWeek}×/нед</span>}
          {habit.weekdays?.length && <span>· {habit.weekdays.length} дн/нед</span>}
        </div>

        {done && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] text-success/70 font-medium"
          >
            ✓ выполнено
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
