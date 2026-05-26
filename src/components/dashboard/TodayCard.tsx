"use client";

import { motion } from "motion/react";
import { Circle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useUpdateTask } from "@/lib/hooks/useTasks";
import type { Task } from "@/types";

interface TodayCardProps {
  pending: Task[];
  overdue: Task[];
}

export function TodayCard({ pending, overdue }: TodayCardProps) {
  const updateTask = useUpdateTask();
  const total = pending.length + overdue.length;

  const toggleTask = (task: Task) => {
    updateTask.mutate({
      id: task.id,
      payload: {
        completed: true,
        completedAt: new Date().toISOString(),
      },
    });
  };

  const allTasks = [...overdue, ...pending].slice(0, 7);

  return (
    <GlassCard className="col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text">Задачи на сегодня</h3>
        <span className="text-xs text-muted">
          {overdue.length > 0 && (
            <span className="text-danger mr-2">{overdue.length} просрочено</span>
          )}
          {total} всего
        </span>
      </div>

      {total === 0 ? (
        <p className="text-sm text-muted text-center py-4">Все задачи выполнены!</p>
      ) : (
        <ul className="space-y-2">
          {allTasks.map((task, i) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 group"
            >
              <button
                onClick={() => toggleTask(task)}
                className="text-muted hover:text-primary transition-colors shrink-0"
              >
                <Circle size={18} />
              </button>
              <span className={`text-sm truncate ${overdue.includes(task) ? "text-danger/80" : "text-text/80"} group-hover:text-text transition-colors`}>
                {task.title}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
