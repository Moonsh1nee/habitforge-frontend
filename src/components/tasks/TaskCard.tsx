"use client";

import { motion } from "motion/react";
import { Calendar, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, isOverdue, getPriorityColor, getPriorityLabel } from "@/lib/utils";
import { useUpdateTask, useDeleteTask } from "@/lib/hooks/useTasks";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const overdue = task.dueDate && isOverdue(task.dueDate) && !task.completed;

  const toggleDone = () => {
    updateTask.mutate({
      id: task.id,
      payload: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null,
      },
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass p-4 group glass-hover"
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={toggleDone}
          className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium transition-all",
              task.completed ? "line-through text-muted" : "text-text"
            )}
          >
            {task.title}
          </p>

          {task.description && (
            <p className="text-xs text-muted mt-0.5 truncate">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0", getPriorityColor(task.priority))}
            >
              {getPriorityLabel(task.priority)}
            </Badge>

            {task.dueDate && (
              <span
                className={cn(
                  "flex items-center gap-1 text-[10px]",
                  overdue ? "text-danger" : "text-muted"
                )}
              >
                <Calendar size={10} />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => deleteTask.mutate(task.id)}
          className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all p-1"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
