"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Pencil, Trash2, CheckCircle2, Circle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, isOverdue, getPriorityColor, getPriorityLabel } from "@/lib/utils";
import { useUpdateTask, useDeleteTask } from "@/lib/hooks/useTasks";
import { SubtaskList } from "./SubtaskList";
import type { Task } from "@/types";

const PRIORITY_ACCENT: Record<number, string> = {
  1: "border-l-danger",
  2: "border-l-warning",
  3: "border-l-muted/30",
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [justCompleted, setJustCompleted] = useState(false);
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const overdue = task.dueDate && isOverdue(task.dueDate) && !task.completed;

  const hasSubtasks = (task.subtasksCount ?? 0) > 0;
  const subtasksDone = task.subtasksDone ?? 0;
  const subtasksCount = task.subtasksCount ?? 0;

  const toggleDone = () => {
    const completing = !task.completed;
    if (completing) setJustCompleted(true);
    updateTask.mutate({
      id: task.id,
      payload: {
        completed: completing,
        completedAt: completing ? new Date().toISOString() : null,
      },
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={cn(
        "glass p-4 group border-l-2 transition-all",
        PRIORITY_ACCENT[task.priority],
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={toggleDone}
          className={cn(
            "mt-0.5 shrink-0 relative transition-all duration-200",
            task.completed ? "text-success" : overdue ? "text-danger hover:text-success" : "text-muted hover:text-primary"
          )}
        >
          <AnimatePresence mode="wait">
            {task.completed || justCompleted ? (
              <motion.span
                key="done"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <CheckCircle2 size={19} />
              </motion.span>
            ) : (
              <motion.span key="todo" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <Circle size={19} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium transition-all duration-300", task.completed ? "line-through text-muted" : "text-text")}>
            {task.title}
          </p>

          {task.description && (
            <p className="text-xs text-muted mt-0.5 truncate">{task.description}</p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getPriorityColor(task.priority))}>
              {getPriorityLabel(task.priority)}
            </Badge>

            {task.dueDate && (
              <span className={cn("flex items-center gap-1 text-[10px]", overdue ? "text-danger font-medium" : "text-muted")}>
                <Calendar size={10} />
                {formatDate(task.dueDate)}
                {overdue && " · просрочено"}
              </span>
            )}

            {task.isRecurring && (
              <span className="text-[10px] text-accent/70">↺ {task.recurrence}</span>
            )}

            {/* Subtasks progress badge */}
            {hasSubtasks && (
              <button
                onClick={(e) => { e.stopPropagation(); setSubtasksOpen((v) => !v); }}
                className={cn(
                  "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border transition-all",
                  subtasksDone === subtasksCount
                    ? "border-success/40 text-success bg-success/8"
                    : "border-border text-muted hover:border-primary/40 hover:text-primary"
                )}
              >
                <span>{subtasksDone}/{subtasksCount}</span>
                <motion.span animate={{ rotate: subtasksOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={9} />
                </motion.span>
              </button>
            )}

            {/* Tags */}
            {(task.tags ?? []).map((tag) => (
              <span
                key={tag.id}
                className="text-[10px] px-1.5 py-0.5 rounded-full border"
                style={{ color: tag.color, borderColor: `${tag.color}40`, background: `${tag.color}12` }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all shrink-0">
          <button
            onClick={() => onEdit(task)}
            aria-label="Редактировать задачу"
            className="text-muted hover:text-primary transition-colors p-1 rounded"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteTask.mutate(task.id)}
            aria-label="Удалить задачу"
            className="text-muted hover:text-danger transition-colors p-1 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Subtasks expandable */}
      <AnimatePresence>
        {subtasksOpen && <SubtaskList taskId={task.id} />}
      </AnimatePresence>
    </motion.div>
  );
}
