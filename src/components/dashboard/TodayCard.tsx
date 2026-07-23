"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle, AlertCircle, Zap } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useUpdateTask } from "@/lib/hooks/useTasks";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

const PRIORITY_DOT: Record<number, string> = {
  1: "bg-danger",
  2: "bg-warning",
  3: "bg-muted/50",
};

interface TodayCardProps {
  pending: Task[];
  overdue: Task[];
}

export function TodayCard({ pending, overdue }: TodayCardProps) {
  const updateTask = useUpdateTask();
  const [justDone, setJustDone] = useState<Set<string>>(new Set());

  const allTasks = [...overdue, ...pending].slice(0, 8);
  const total = pending.length + overdue.length;

  const toggleTask = (task: Task) => {
    if (justDone.has(task.id)) return;
    setJustDone((prev) => new Set(prev).add(task.id));
    setTimeout(() => {
      updateTask.mutate({ id: task.id, payload: { completed: true } });
    }, 400);
  };

  if (total === 0) {
    return (
      <GlassCard className="col-span-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-8 gap-3"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center"
          >
            <Zap size={26} className="text-success" />
          </motion.div>
          <div className="text-center">
            <p className="font-semibold text-text">Задачи на сегодня выполнены!</p>
            <p className="text-xs text-muted mt-0.5">Отличная продуктивность</p>
          </div>
        </motion.div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="col-span-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-text">Задачи на сегодня</h2>
        <div className="flex items-center gap-2">
          {overdue.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-danger">
              <AlertCircle size={12} />
              {overdue.length} просрочено
            </span>
          )}
          <span className="text-xs text-muted">{total} задач</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(4, (justDone.size / total) * 100)}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />
      </div>

      <ul className="space-y-1.5">
        <AnimatePresence>
          {allTasks.map((task, i) => {
            const done = justDone.has(task.id);
            const isOverdue = overdue.includes(task);
            return (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, x: -8 }}
                animate={done
                  ? { opacity: 0, x: 20, height: 0, marginBottom: 0 }
                  : { opacity: 1, x: 0, height: "auto" }
                }
                transition={{
                  delay: done ? 0 : i * 0.04,
                  duration: done ? 0.35 : 0.3,
                }}
                className="flex items-center gap-3 group"
              >
                {/* Priority indicator */}
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", PRIORITY_DOT[task.priority])} />

                <button
                  onClick={() => toggleTask(task)}
                  className={cn(
                    "shrink-0 transition-all duration-200",
                    done ? "text-success scale-110" : "text-muted hover:text-primary"
                  )}
                >
                  {done
                    ? <CheckCircle2 size={18} className="animate-check-pop" />
                    : <Circle size={18} />
                  }
                </button>

                <span className={cn(
                  "text-sm flex-1 truncate transition-all",
                  done ? "line-through text-muted" : isOverdue ? "text-danger/80" : "text-text/85",
                  "group-hover:text-text"
                )}>
                  {task.title}
                </span>

                {isOverdue && !done && (
                  <span className="text-[10px] text-danger/60 shrink-0">просрочено</span>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {total > 8 && (
        <p className="text-xs text-muted mt-3 text-center">
          + ещё {total - 8} задач в списке
        </p>
      )}
    </GlassCard>
  );
}
