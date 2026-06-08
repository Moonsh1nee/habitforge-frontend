"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ArrowUp, ArrowDown, X } from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority } from "@/types";
import type { TaskFilters } from "@/lib/api/tasks";

type CompletedFilter = "all" | "todo" | "done";
type OrderBy = "createdAt" | "dueDate" | "priority";

const PRIORITY_CHIPS: { label: string; value: TaskPriority | undefined }[] = [
  { label: "Все", value: undefined },
  { label: "Высокий", value: 1 },
  { label: "Средний", value: 2 },
  { label: "Низкий", value: 3 },
];

const PRIORITY_ACTIVE_CLASS: Record<number, string> = {
  1: "border-warning/60 text-warning bg-warning/10",
  2: "border-accent/60 text-accent bg-accent/10",
  3: "border-muted/40 text-muted bg-muted/10",
};

export default function TasksPage() {
  const [completedFilter, setCompletedFilter] = useState<CompletedFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>(undefined);
  const [orderBy, setOrderBy] = useState<OrderBy>("createdAt");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filters: TaskFilters = {
    ...(completedFilter !== "all" && { completed: completedFilter === "done" }),
    ...(priorityFilter !== undefined && { priority: priorityFilter }),
    ...(debouncedSearch && { search: debouncedSearch }),
    order_by: orderBy,
    order: orderDir,
  };

  const { data, isLoading } = useTasks(filters);
  const tasks = data?.items ?? [];

  const hasActiveFilters =
    completedFilter !== "all" ||
    priorityFilter !== undefined ||
    search !== "" ||
    orderBy !== "createdAt" ||
    orderDir !== "desc";

  const resetFilters = () => {
    setCompletedFilter("all");
    setPriorityFilter(undefined);
    setSearch("");
    setOrderBy("createdAt");
    setOrderDir("desc");
  };

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Задачи</h1>
          <p className="text-sm text-muted mt-0.5">{data?.total ?? 0} задач всего</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gradient-primary text-white gap-2">
          <Plus size={16} />
          Новая задача
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <Input
          placeholder="Поиск задач..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Row 1: Completion tabs */}
      <Tabs value={completedFilter} onValueChange={(v) => setCompletedFilter(v as CompletedFilter)}>
        <TabsList className="bg-transparent p-0 gap-1 h-auto">
          {(["all", "todo", "done"] as const).map((v) => (
            <TabsTrigger
              key={v}
              value={v}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all text-muted data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_var(--color-primary-glow)] hover:text-text"
            >
              {v === "all" ? "Все" : v === "todo" ? "Активные" : "Выполненные"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Row 2: Priority chips + sort */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRIORITY_CHIPS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setPriorityFilter(value)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-all",
                priorityFilter === value
                  ? value !== undefined
                    ? PRIORITY_ACTIVE_CLASS[value]
                    : "border-primary/60 text-primary bg-primary/10"
                  : "border-border text-muted hover:text-text"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Sort by */}
          <Select value={orderBy} onValueChange={(v) => setOrderBy(v as OrderBy)}>
            <SelectTrigger size="sm" className="w-36 sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">По дате создания</SelectItem>
              <SelectItem value="dueDate">По дедлайну</SelectItem>
              <SelectItem value="priority">По приоритету</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort direction */}
          <button
            onClick={() => setOrderDir((d) => (d === "asc" ? "desc" : "asc"))}
            title={orderDir === "asc" ? "По возрастанию" : "По убыванию"}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-white/5 text-muted hover:text-text hover:border-primary/40 transition-all"
          >
            {orderDir === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </button>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-muted hover:text-danger transition-colors flex items-center gap-1"
            >
              <X size={12} />
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <ListSkeleton count={5} />
      ) : (
        <TaskList tasks={tasks} onEdit={setEditTask} />
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая задача</DialogTitle>
          </DialogHeader>
          <TaskForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать задачу</DialogTitle>
          </DialogHeader>
          {editTask && <TaskForm task={editTask} onSuccess={() => setEditTask(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
