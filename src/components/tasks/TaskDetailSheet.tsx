"use client";

import { useState } from "react";
import { Pencil, Trash2, Calendar, Clock, RotateCcw } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { SubtaskList } from "./SubtaskList";
import { TaskComments } from "./TaskComments";
import { useUpdateTask, useDeleteTask } from "@/lib/hooks/useTasks";
import { useProjects } from "@/lib/hooks/useProjects";
import { cn, formatDate, isOverdue, getPriorityColor, getPriorityLabel } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

const ALL_STATUSES: Array<{ id: TaskStatus; label: string }> = [
  { id: "todo",        label: "К работе"    },
  { id: "in_progress", label: "В работе"    },
  { id: "review",      label: "На проверке" },
  { id: "done",        label: "Готово"      },
  { id: "cancelled",   label: "Отменено"    },
];

const RECURRENCE_LABELS: Record<string, string> = {
  daily: "Ежедневно",
  weekly: "Еженедельно",
  monthly: "Ежемесячно",
};

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (task: Task) => void;
}

export function TaskDetailSheet({ task, open, onOpenChange, onEdit }: TaskDetailSheetProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: projects = [] } = useProjects();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!task) return null;

  const project = task.projectId ? projects.find((p) => p.id === task.projectId) : null;
  const overdue = task.dueDate && isOverdue(task.dueDate) && !task.completed;
  const estimatedMinutes = task.estimatedMinutes ?? 0;
  const timeSpentMinutes = task.timeSpentMinutes ?? 0;
  const currentStatus = task.status ?? "todo";

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        setConfirmDelete(false);
        onOpenChange(false);
      },
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col gap-0 p-0">
          {/* Cover color strip */}
          {task.coverColor && (
            <div className="h-1 shrink-0" style={{ background: task.coverColor }} />
          )}

          <div className="flex flex-col gap-5 p-5 flex-1">
            {/* Visually hidden title for accessibility */}
            <SheetTitle className="sr-only">{task.title}</SheetTitle>

            {/* Header */}
            <div className="flex items-start gap-3 pr-8">
              <div className="flex-1 min-w-0">
                {task.icon && (
                  <span className="text-3xl block mb-1">{task.icon}</span>
                )}
                <h2 className={cn(
                  "font-bold text-xl leading-tight",
                  task.completed ? "line-through text-muted" : "text-text"
                )}>
                  {task.title}
                </h2>
              </div>
              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                <button
                  onClick={() => { onEdit(task); onOpenChange(false); }}
                  className="text-muted hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10"
                  aria-label="Редактировать"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-muted hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-danger/10"
                  aria-label="Удалить"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap gap-1.5">
              {ALL_STATUSES.map((s) => {
                const active = currentStatus === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (!active) updateTask.mutate({ id: task.id, payload: { status: s.id } });
                    }}
                    className={cn(
                      "text-xs px-3 py-1 rounded-full border transition-all font-medium",
                      active
                        ? "bg-primary/10 text-primary border-primary/40"
                        : "border-border text-muted hover:text-text hover:border-border/80"
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Metadata grid */}
            <div className="glass rounded-xl p-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {/* Priority */}
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted uppercase tracking-wider">Приоритет</p>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border inline-block", getPriorityColor(task.priority))}>
                  {getPriorityLabel(task.priority)}
                </span>
              </div>

              {/* Due date */}
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted uppercase tracking-wider">Дедлайн</p>
                {task.dueDate ? (
                  <span className={cn("flex items-center gap-1 text-xs", overdue ? "text-danger font-medium" : "text-text")}>
                    <Calendar size={11} />
                    {formatDate(task.dueDate)}
                    {overdue && " · просрочено"}
                  </span>
                ) : (
                  <span className="text-xs text-muted/50">—</span>
                )}
              </div>

              {/* Project */}
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted uppercase tracking-wider">Проект</p>
                {project ? (
                  <span className="flex items-center gap-1.5 text-xs text-text">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: project.color }} />
                    {project.name}
                  </span>
                ) : (
                  <span className="text-xs text-muted/50">—</span>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted uppercase tracking-wider">Теги</p>
                {(task.tags ?? []).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-[10px] px-1.5 py-0.5 rounded-full border"
                        style={{ color: tag.color, borderColor: `${tag.color}40`, background: `${tag.color}12` }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted/50">—</span>
                )}
              </div>

              {/* Time */}
              {(estimatedMinutes > 0 || timeSpentMinutes > 0) && (
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Время</p>
                  <span className="flex items-center gap-1 text-xs text-text">
                    <Clock size={11} />
                    {timeSpentMinutes > 0 && estimatedMinutes > 0
                      ? `${timeSpentMinutes}м потрачено / ${estimatedMinutes}м план`
                      : estimatedMinutes > 0
                      ? `~${estimatedMinutes}м`
                      : `${timeSpentMinutes}м потрачено`}
                  </span>
                </div>
              )}

              {/* Recurrence */}
              {task.isRecurring && task.recurrence && (
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Повторение</p>
                  <span className="flex items-center gap-1 text-xs text-accent">
                    <RotateCcw size={11} />
                    {RECURRENCE_LABELS[task.recurrence] ?? task.recurrence}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider mb-1.5">Описание</p>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Subtasks */}
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
                Подзадачи
                {(task.subtasksCount ?? 0) > 0 && (
                  <span className="ml-1.5 text-primary">{task.subtasksDone}/{task.subtasksCount}</span>
                )}
              </p>
              <SubtaskList taskId={task.id} />
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Comments */}
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
                Комментарии
                {(task.commentsCount ?? 0) > 0 && (
                  <span className="ml-1.5 text-primary">{task.commentsCount}</span>
                )}
              </p>
              <TaskComments taskId={task.id} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={handleDelete}
        isPending={deleteTask.isPending}
        title="Удалить задачу?"
        description="Это действие нельзя отменить. Подзадачи тоже удалятся."
      />

    </>
  );
}
