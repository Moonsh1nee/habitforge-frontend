"use client";

import { differenceInCalendarDays, parseISO } from "date-fns";
import { Circle, CheckCircle2 } from "lucide-react";
import { useUpdateTask } from "@/lib/hooks/useTasks";
import type { Task } from "@/types";

const QUADRANTS = [
  {
    key: "q1",
    label: "Сделать сейчас",
    desc: "Срочно + Важно",
    bg: "bg-danger/6",
    border: "border-danger/20",
    dot: "bg-danger",
    test: (t: Task) => isUrgent(t) && isImportant(t),
  },
  {
    key: "q2",
    label: "Запланировать",
    desc: "Важно, не срочно",
    bg: "bg-primary/6",
    border: "border-primary/20",
    dot: "bg-primary",
    test: (t: Task) => !isUrgent(t) && isImportant(t),
  },
  {
    key: "q3",
    label: "Делегировать",
    desc: "Срочно, не важно",
    bg: "bg-warning/6",
    border: "border-warning/20",
    dot: "bg-warning",
    test: (t: Task) => isUrgent(t) && !isImportant(t),
  },
  {
    key: "q4",
    label: "Исключить",
    desc: "Не срочно, не важно",
    bg: "bg-white/2",
    border: "border-border",
    dot: "bg-muted",
    test: (t: Task) => !isUrgent(t) && !isImportant(t),
  },
] as const;

function isUrgent(t: Task) {
  if (!t.dueDate) return false;
  return differenceInCalendarDays(parseISO(t.dueDate), new Date()) <= 1;
}

function isImportant(t: Task) {
  return t.priority === 1;
}

function MatrixTaskRow({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  const update = useUpdateTask();

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    update.mutate({ id: task.id, payload: { completed: !task.completed } });
  };

  return (
    <div
      className="flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
      onClick={() => onEdit(task)}
    >
      <button onClick={toggle} className="shrink-0 text-muted hover:text-success transition-colors">
        {task.completed
          ? <CheckCircle2 size={14} className="text-success" />
          : <Circle size={14} />
        }
      </button>
      <span className={`text-xs leading-snug truncate ${task.completed ? "line-through text-muted" : "text-text"}`}>
        {task.title}
      </span>
    </div>
  );
}

interface MatrixViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function MatrixView({ tasks, onEdit }: MatrixViewProps) {
  const active = tasks.filter((t) => !t.completed);

  return (
    <div className="grid grid-cols-2 gap-3">
      {QUADRANTS.map(({ key, label, desc, bg, border, dot, test }) => {
        const quadTasks = active.filter(test);
        return (
          <div
            key={key}
            className={`${bg} border ${border} rounded-2xl p-4 min-h-48 flex flex-col`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
              <div>
                <p className="text-xs font-semibold text-text leading-tight">{label}</p>
                <p className="text-[10px] text-muted leading-none mt-0.5">{desc}</p>
              </div>
              <span className="ml-auto text-[10px] text-muted tabular-nums bg-white/8 px-1.5 py-0.5 rounded-full">
                {quadTasks.length}
              </span>
            </div>
            <div className="flex-1 space-y-0.5 overflow-y-auto">
              {quadTasks.length === 0 ? (
                <p className="text-[11px] text-muted/50 text-center py-4">Нет задач</p>
              ) : (
                quadTasks.map((t) => (
                  <MatrixTaskRow key={t.id} task={t} onEdit={onEdit} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
