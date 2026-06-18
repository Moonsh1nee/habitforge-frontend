"use client";

import { useState, useMemo } from "react";
import {
  format, addDays, addWeeks, addMonths,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, isToday, isSameMonth, parseISO,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

type CalendarView = "day" | "3day" | "week" | "month";

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: "day", label: "День" },
  { value: "3day", label: "3 дня" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
];

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const PRIORITY_BAR: Record<number, string> = {
  1: "border-l-warning",
  2: "border-l-accent",
  3: "border-l-muted/50",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getViewDays(view: CalendarView, anchor: Date): Date[] {
  switch (view) {
    case "day":
      return [anchor];
    case "3day":
      return eachDayOfInterval({ start: anchor, end: addDays(anchor, 2) });
    case "week": {
      const s = startOfWeek(anchor, { weekStartsOn: 1 });
      const e = endOfWeek(anchor, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: s, end: e });
    }
    case "month": {
      const ms = startOfMonth(anchor);
      const me = endOfMonth(anchor);
      return eachDayOfInterval({
        start: startOfWeek(ms, { weekStartsOn: 1 }),
        end: endOfWeek(me, { weekStartsOn: 1 }),
      });
    }
  }
}

function shiftAnchor(view: CalendarView, anchor: Date, dir: 1 | -1): Date {
  switch (view) {
    case "day":  return addDays(anchor, dir);
    case "3day": return addDays(anchor, dir * 3);
    case "week": return addWeeks(anchor, dir);
    case "month": return addMonths(anchor, dir);
  }
}

function getViewTitle(view: CalendarView, anchor: Date): string {
  switch (view) {
    case "day":
      return format(anchor, "d MMMM yyyy", { locale: ru });
    case "3day": {
      const e = addDays(anchor, 2);
      return `${format(anchor, "d", { locale: ru })} – ${format(e, "d MMMM yyyy", { locale: ru })}`;
    }
    case "week": {
      const s = startOfWeek(anchor, { weekStartsOn: 1 });
      const e = endOfWeek(anchor, { weekStartsOn: 1 });
      return `${format(s, "d MMM", { locale: ru })} – ${format(e, "d MMM yyyy", { locale: ru })}`;
    }
    case "month": {
      const s = format(anchor, "LLLL yyyy", { locale: ru });
      return s[0].toUpperCase() + s.slice(1);
    }
  }
}

// ─── Task Pill ────────────────────────────────────────────────────────────────

function TaskPill({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        "w-full text-left text-xs px-1.5 py-0.5 rounded-md border-l-2 bg-white/5 hover:bg-white/12 transition-colors truncate block",
        PRIORITY_BAR[task.priority],
        task.completed && "opacity-50 line-through text-muted"
      )}
    >
      {task.title}
    </button>
  );
}

// ─── Month Cell ───────────────────────────────────────────────────────────────

function MonthCell({ date, tasks, inMonth, onAdd, onTaskClick, onViewDay }: {
  date: Date;
  tasks: Task[];
  inMonth: boolean;
  onAdd: (dateStr: string) => void;
  onTaskClick: (task: Task) => void;
  onViewDay: (date: Date) => void;
}) {
  const MAX = 3;
  const visible = tasks.slice(0, MAX);
  const overflow = tasks.length - MAX;
  const today = isToday(date);

  return (
    <div
      onClick={() => onAdd(format(date, "yyyy-MM-dd"))}
      className={cn(
        "min-h-24 p-2 border-r border-b border-border cursor-pointer hover:bg-white/3 transition-colors group last:border-r-0",
        !inMonth && "opacity-35"
      )}
    >
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-1 transition-colors",
        today
          ? "bg-primary text-white font-bold"
          : "text-muted group-hover:text-text"
      )}>
        {format(date, "d")}
      </div>
      <div className="space-y-0.5">
        {visible.map(t => (
          <TaskPill key={t.id} task={t} onClick={() => onTaskClick(t)} />
        ))}
        {overflow > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onViewDay(date); }}
            className="text-xs text-primary/70 hover:text-primary pl-1 transition-colors"
          >
            +{overflow} ещё
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Day Column ───────────────────────────────────────────────────────────────

function DayColumn({ date, tasks, onAdd, onTaskClick }: {
  date: Date;
  tasks: Task[];
  onAdd: (dateStr: string) => void;
  onTaskClick: (task: Task) => void;
}) {
  const today = isToday(date);
  const dateStr = format(date, "yyyy-MM-dd");

  return (
    <div className="flex-1 min-w-0 flex flex-col border-r border-border last:border-r-0">
      {/* Header */}
      <div className={cn(
        "text-center py-3 border-b border-border bg-surface/20",
        today && "bg-primary/8"
      )}>
        <p className="text-xs text-muted uppercase tracking-wide">
          {format(date, "EEE", { locale: ru })}
        </p>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1 text-sm font-semibold",
          today ? "bg-primary text-white" : "text-text"
        )}>
          {format(date, "d")}
        </div>
      </div>

      {/* Tasks area — click to add */}
      <div
        className="flex-1 p-2 cursor-pointer hover:bg-white/2 transition-colors min-h-52 group"
        onClick={() => onAdd(dateStr)}
      >
        <div className="space-y-1">
          {tasks.map(t => (
            <TaskPill key={t.id} task={t} onClick={() => onTaskClick(t)} />
          ))}
        </div>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus size={13} className="text-muted" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [createDate, setCreateDate] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const days = useMemo(() => getViewDays(view, anchor), [view, anchor]);
  const rangeStart = format(days[0], "yyyy-MM-dd") + "T00:00:00";
  const rangeEnd = format(days[days.length - 1], "yyyy-MM-dd") + "T23:59:59";

  const { data, isLoading, isFetching } = useTasks({ due_after: rangeStart, due_before: rangeEnd, limit: 100 });
  const tasks = data?.items ?? [];

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = task.dueDate.split("T")[0];
      const existing = map.get(key) ?? [];
      existing.push(task);
      map.set(key, existing);
    }
    return map;
  }, [tasks]);

  const title = getViewTitle(view, anchor);

  return (
    <div className="space-y-5 h-full flex flex-col">
      <PageHeader
        title="Календарь"
        action={
          <Button
            onClick={() => setCreateDate(format(new Date(), "yyyy-MM-dd"))}
            className="gradient-primary text-white gap-2"
          >
            <Plus size={16} />
            Новая задача
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnchor(d => shiftAnchor(view, d, -1))}
            className="p-2 rounded-lg border border-border text-muted hover:text-text hover:border-primary/40 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setAnchor(new Date())}
            className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted hover:text-text hover:border-primary/40 transition-all"
          >
            Сегодня
          </button>
          <button
            onClick={() => setAnchor(d => shiftAnchor(view, d, 1))}
            className="p-2 rounded-lg border border-border text-muted hover:text-text hover:border-primary/40 transition-all"
          >
            <ChevronRight size={16} />
          </button>
          <h2 className="text-sm font-semibold text-text ml-1 capitalize">{title}</h2>
        </div>

        <FilterTabs<CalendarView>
          value={view}
          onChange={setView}
          options={VIEW_OPTIONS}
        />
      </div>

      {/* Calendar */}
      <div className="glass overflow-hidden flex-1 relative">
        {/* Fetching overlay */}
        {isFetching && !isLoading && (
          <div className="absolute top-2 right-3 z-10">
            <Loader2 size={14} className="animate-spin text-primary/60" />
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-52">
            <Loader2 size={24} className="animate-spin text-primary/50" />
          </div>
        ) : view === "month" ? (
          <>
            {/* Week day headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {DAY_NAMES.map(d => (
                <div
                  key={d}
                  className="py-2.5 text-center text-xs text-muted font-medium border-r border-border last:border-r-0"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Week rows */}
            {Array.from({ length: Math.ceil(days.length / 7) }, (_, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {days.slice(wi * 7, wi * 7 + 7).map(day => (
                  <MonthCell
                    key={format(day, "yyyy-MM-dd")}
                    date={day}
                    tasks={tasksByDate.get(format(day, "yyyy-MM-dd")) ?? []}
                    inMonth={isSameMonth(day, anchor)}
                    onAdd={setCreateDate}
                    onTaskClick={setEditTask}
                    onViewDay={(d) => { setView("day"); setAnchor(d); }}
                  />
                ))}
              </div>
            ))}
          </>
        ) : (
          <div className="flex h-full">
            {days.map(day => (
              <DayColumn
                key={format(day, "yyyy-MM-dd")}
                date={day}
                tasks={tasksByDate.get(format(day, "yyyy-MM-dd")) ?? []}
                onAdd={setCreateDate}
                onTaskClick={setEditTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create task dialog */}
      <FormDialog
        open={!!createDate}
        onOpenChange={(o) => !o && setCreateDate(null)}
        title={
          createDate
            ? `Задача на ${format(parseISO(createDate), "d MMMM", { locale: ru })}`
            : "Новая задача"
        }
      >
        {createDate && (
          <TaskForm
            key={createDate}
            defaultDueDate={createDate}
            onSuccess={() => setCreateDate(null)}
          />
        )}
      </FormDialog>

      {/* Edit task dialog */}
      <FormDialog
        open={!!editTask}
        onOpenChange={(o) => !o && setEditTask(null)}
        title="Редактировать задачу"
      >
        {editTask && (
          <TaskForm task={editTask} onSuccess={() => setEditTask(null)} />
        )}
      </FormDialog>
    </div>
  );
}
