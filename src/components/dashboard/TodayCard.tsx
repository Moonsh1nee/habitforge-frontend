"use client";

import { motion } from "motion/react";
import { CheckCircle2, Circle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useUpdateTask } from "@/lib/hooks/useTasks";
import type { Task } from "@/types";

interface TodayCardProps {
  tasks: Task[];
}

export function TodayCard({ tasks }: TodayCardProps) {
  const updateTask = useUpdateTask();

  const toggleTask = (task: Task) => {
    updateTask.mutate({
      id: task.id,
      payload: {
        status: task.status === "done" ? "todo" : "done",
        completedAt: task.status === "done" ? undefined : new Date().toISOString(),
      },
    });
  };

  const incomplete = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <GlassCard className="col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text">Задачи на сегодня</h3>
        <span className="text-xs text-muted">
          {done}/{tasks.length} выполнено
        </span>
      </div>

      {incomplete.length === 0 ? (
        <p className="text-sm text-muted text-center py-4">
          Все задачи выполнены! 🎉
        </p>
      ) : (
        <ul className="space-y-2">
          {incomplete.slice(0, 5).map((task, i) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 group"
            >
              <button
                onClick={() => toggleTask(task)}
                className="text-muted hover:text-primary transition-colors flex-shrink-0"
              >
                <Circle size={18} />
              </button>
              <span className="text-sm text-text/80 group-hover:text-text transition-colors truncate">
                {task.title}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
