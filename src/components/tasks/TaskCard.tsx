"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Pencil, Trash2, CheckCircle2, Circle, ChevronDown, MessageSquare, Clock, Bell, BellOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { cn, formatDate, isOverdue, getPriorityColor, getPriorityLabel } from "@/lib/utils";
import { useUpdateTask, useDeleteTask, useSnoozeReminder } from "@/lib/hooks/useTasks";
import { useProjects } from "@/lib/hooks/useProjects";
import { SubtaskList } from "./SubtaskList";
import { TaskComments } from "./TaskComments";
import { TaskTimerPanel } from "./TaskTimerPanel";
import { useTaskTimer } from "@/lib/hooks/useTasks";
import type { Task, TaskStatus } from "@/types";

const PRIORITY_ACCENT: Record<number, string> = {
  1: "border-l-danger",
  2: "border-l-warning",
  3: "border-l-muted/30",
};

const STATUS_BADGE: Partial<Record<TaskStatus, { label: string; className: string }>> = {
  in_progress: { label: "В работе",     className: "bg-accent/10 text-accent border-accent/30" },
  review:      { label: "На проверке",  className: "bg-warning/10 text-warning border-warning/30" },
  cancelled:   { label: "Отменено",     className: "bg-muted/10 text-muted border-muted/20" },
};

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  todo:        "in_progress",
  in_progress: "review",
  review:      "done",
  done:        "todo",
  cancelled:   "todo",
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onCardClick?: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onCardClick }: TaskCardProps) {
  const router = useRouter();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const snoozeReminder = useSnoozeReminder();
  const { data: projects = [] } = useProjects();
  const [justCompleted, setJustCompleted] = useState(false);
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: timerStatus } = useTaskTimer(task.id);
  const overdue = task.dueDate && isOverdue(task.dueDate) && !task.completed;

  const hasSubtasks = (task.subtasksCount ?? 0) > 0;
  const subtasksDone = task.subtasksDone ?? 0;
  const subtasksCount = task.subtasksCount ?? 0;
  const commentsCount = task.commentsCount ?? 0;
  const estimatedMinutes = task.estimatedMinutes ?? 0;
  const timeSpentMinutes = task.timeSpentMinutes ?? 0;
  const statusBadge = STATUS_BADGE[task.status ?? "todo"];
  const project = task.projectId ? projects.find((p) => p.id === task.projectId) : null;

  const toggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const completing = !task.completed;
    if (completing) setJustCompleted(true);
    updateTask.mutate({ id: task.id, payload: { status: completing ? "done" : "todo" } });
  };

  const cycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = STATUS_CYCLE[task.status ?? "todo"];
    updateTask.mutate({ id: task.id, payload: { status: next } });
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        onClick={() => onCardClick?.(task)}
        className={cn(
          "glass p-4 group border-l-2 transition-all",
          PRIORITY_ACCENT[task.priority],
          task.completed && "opacity-60",
          onCardClick && "cursor-pointer"
        )}
        style={task.coverColor ? { borderTopColor: task.coverColor, borderTopWidth: 2 } : {}}
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
              {task.icon && <span className="mr-1.5">{task.icon}</span>}
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

              {/* Reminder */}
              {task.reminderSnoozedUntil ? (
                <span className="flex items-center gap-1 text-[10px] text-warning">
                  <BellOff size={10} />
                  Отложено до {formatDate(task.reminderSnoozedUntil, "HH:mm")}
                </span>
              ) : task.reminderMode && task.reminderMode !== "none" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted hover:border-primary/40 hover:text-primary transition-all"
                        aria-label="Отложить напоминание"
                      >
                        <Bell size={10} />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="start" className="w-40">
                    {[15, 30, 60].map((minutes) => (
                      <DropdownMenuItem
                        key={minutes}
                        onClick={(e) => {
                          e.stopPropagation();
                          snoozeReminder.mutate({ taskId: task.id, minutes });
                        }}
                        className="cursor-pointer text-xs px-3 py-1.5"
                      >
                        Отложить на {minutes} мин
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}

              {/* Status badge — clickable to cycle */}
              {statusBadge && (
                <button
                  onClick={cycleStatus}
                  className={cn("text-[10px] px-1.5 py-0.5 rounded-full border transition-all hover:opacity-80", statusBadge.className)}
                >
                  {statusBadge.label}
                </button>
              )}

              {/* Time */}
              {(estimatedMinutes > 0 || timeSpentMinutes > 0) && (
                <button
                  onClick={(e) => { e.stopPropagation(); setTimerOpen((v) => !v); }}
                  className={cn(
                    "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border transition-all",
                    timerOpen || timerStatus?.running
                      ? "border-primary/40 text-primary bg-primary/8"
                      : "border-transparent text-muted hover:border-primary/40 hover:text-primary"
                  )}
                >
                  <Clock size={9} />
                  {timeSpentMinutes > 0 && estimatedMinutes > 0
                    ? `${timeSpentMinutes}м / ${estimatedMinutes}м`
                    : estimatedMinutes > 0
                    ? `~${estimatedMinutes}м`
                    : `${timeSpentMinutes}м`}
                  {timerStatus?.running && (
                    <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                  )}
                </button>
              )}
              {!(estimatedMinutes > 0 || timeSpentMinutes > 0) && (
                <button
                  onClick={(e) => { e.stopPropagation(); setTimerOpen((v) => !v); }}
                  className={cn(
                    "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border transition-all",
                    timerOpen || timerStatus?.running
                      ? "border-primary/40 text-primary bg-primary/8"
                      : "opacity-0 group-hover:opacity-100 border-border text-muted hover:border-primary/40 hover:text-primary"
                  )}
                >
                  <Clock size={9} />
                  {timerStatus?.running && (
                    <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                  )}
                </button>
              )}

              {/* Project chip */}
              {project && (
                <span className="flex items-center gap-1 text-[10px] text-muted">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: project.color }} />
                  {project.name}
                </span>
              )}

              {/* Tags */}
              {(task.tags ?? []).map((tag) => (
                <button
                  key={tag.id}
                  onClick={(e) => { e.stopPropagation(); router.push(`/tasks?tag_id=${tag.id}`); }}
                  className="text-[10px] px-1.5 py-0.5 rounded-full border hover:opacity-70 transition-opacity cursor-pointer"
                  style={{ color: tag.color, borderColor: `${tag.color}40`, background: `${tag.color}12` }}
                >
                  {tag.name}
                </button>
              ))}

              {/* Comments button — always visible on hover, visible when count > 0 */}
              <button
                onClick={(e) => { e.stopPropagation(); setCommentsOpen((v) => !v); }}
                className={cn(
                  "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border transition-all",
                  commentsOpen
                    ? "border-primary/40 text-primary bg-primary/8"
                    : commentsCount > 0
                    ? "border-border text-muted hover:border-primary/40 hover:text-primary"
                    : "opacity-0 group-hover:opacity-100 border-border text-muted hover:border-primary/40 hover:text-primary"
                )}
              >
                <MessageSquare size={9} />
                {commentsCount > 0 && <span>{commentsCount}</span>}
              </button>

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
            </div>
          </div>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              aria-label="Редактировать задачу"
              className="text-muted hover:text-primary transition-colors p-1 rounded"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
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

        {/* Comments expandable */}
        <AnimatePresence>
          {commentsOpen && <TaskComments taskId={task.id} />}
        </AnimatePresence>

        {/* Timer expandable */}
        <AnimatePresence>
          {timerOpen && <TaskTimerPanel taskId={task.id} />}
        </AnimatePresence>
      </motion.div>

      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={() => deleteTask.mutate(task.id)}
        isPending={deleteTask.isPending}
        title="Удалить задачу?"
        description="Это действие нельзя отменить. Подзадачи тоже удалятся."
      />
    </>
  );
}
