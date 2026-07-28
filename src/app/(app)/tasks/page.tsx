"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, ArrowUp, ArrowDown, X, FolderOpen } from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import { useProjects } from "@/lib/hooks/useProjects";
import { useTags } from "@/lib/hooks/useTags";
import { TaskList } from "@/components/tasks/TaskList";
import { KanbanView } from "@/components/tasks/KanbanView";
import { MatrixView } from "@/components/tasks/MatrixView";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskDetailSheet } from "@/components/tasks/TaskDetailSheet";
import { ProjectsManager } from "@/components/tasks/ProjectsManager";
import { ReminderMigrationBanner } from "@/components/tasks/ReminderMigrationBanner";
import { ViewSwitcher } from "@/components/tasks/ViewSwitcher";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { useTaskViewStore } from "@/lib/stores/taskViewStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import type { TaskFilters } from "@/lib/api/tasks";

type OrderBy = "createdAt" | "dueDate" | "priority";

const PRIORITY_CHIPS: { label: string; value: TaskPriority | undefined }[] = [
  { label: "Все", value: undefined },
  { label: "Высокий", value: 1 },
  { label: "Средний", value: 2 },
  { label: "Низкий", value: 3 },
];

const STATUS_CHIPS: { label: string; value: TaskStatus | undefined }[] = [
  { label: "Все", value: undefined },
  { label: "К работе", value: "todo" },
  { label: "В работе", value: "in_progress" },
  { label: "На проверке", value: "review" },
];

const ORDER_BY_LABELS: Record<string, string> = {
  createdAt: "По дате создания",
  dueDate: "По дедлайну",
  priority: "По приоритету",
};

const PRIORITY_ACTIVE_CLASS: Record<number, string> = {
  1: "border-warning/60 text-warning bg-warning/10",
  2: "border-accent/60 text-accent bg-accent/10",
  3: "border-muted/40 text-muted bg-muted/10",
};

const STATUS_ACTIVE_CLASS: Record<string, string> = {
  todo:        "border-muted/50 text-muted bg-muted/10",
  in_progress: "border-accent/60 text-accent bg-accent/10",
  review:      "border-warning/60 text-warning bg-warning/10",
};

function TasksPageInner() {
  const searchParams = useSearchParams();
  const urlProjectId: string | undefined = searchParams.get("project_id") ?? undefined;
  const urlTagId: string | undefined = searchParams.get("tag_id") ?? undefined;
  const urlCreate = searchParams.get("create");

  const { view, kanbanGroupBy } = useTaskViewStore();

  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | undefined>(urlProjectId);
  const [tagId, setTagId] = useState<string | undefined>(urlTagId);
  const [orderBy, setOrderBy] = useState<OrderBy>("createdAt");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [projectsOpen, setProjectsOpen] = useState(false);

  const { data: projects = [] } = useProjects();
  const { data: allTags = [] } = useTags();

  useEffect(() => { setProjectId(urlProjectId); }, [urlProjectId]);
  useEffect(() => { setTagId(urlTagId); }, [urlTagId]);
  useEffect(() => { if (urlCreate === "1") setCreateOpen(true); }, [urlCreate]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filters: TaskFilters = {
    ...(priorityFilter !== undefined && { priority: priorityFilter }),
    ...(statusFilter !== undefined && { status: statusFilter }),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(projectId && { project_id: projectId }),
    ...(tagId && { tag_id: tagId }),
    order_by: orderBy,
    order: orderDir,
  };

  const { data, isLoading } = useTasks(filters);
  const tasks = data?.items ?? [];

  const activeProject = projects.find((p) => p.id === projectId);
  const activeTag = allTags.find((t) => t.id === tagId);

  const hasActiveFilters =
    priorityFilter !== undefined ||
    statusFilter !== undefined ||
    search !== "" ||
    projectId !== undefined ||
    tagId !== undefined ||
    orderBy !== "createdAt" ||
    orderDir !== "desc";

  const resetFilters = () => {
    setPriorityFilter(undefined);
    setStatusFilter(undefined);
    setProjectId(undefined);
    setTagId(undefined);
    setSearch("");
    setOrderBy("createdAt");
    setOrderDir("desc");
  };

  return (
    <div className={cn("space-y-5", view !== "kanban" && "max-w-3xl")}>
      <PageHeader
        title={activeProject ? activeProject.name : "Задачи"}
        subtitle={`${data?.total ?? 0} задач всего`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setProjectsOpen(true)}
              className="border-border text-muted hover:text-text gap-2"
            >
              <FolderOpen size={16} />
              <span className="hidden sm:inline">Проекты</span>
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="bg-primary text-white gap-2">
              <Plus size={16} />
              Новая задача
            </Button>
          </div>
        }
      />

      <ReminderMigrationBanner
        show={tasks.some((t) => t.dueDate && !t.completed && (!t.reminderMode || t.reminderMode === "none"))}
      />

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <Input
          placeholder="Поиск задач..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {(activeProject || activeTag) && (
        <div className="flex flex-wrap gap-2">
          {activeProject && (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border" style={{ color: activeProject.color, borderColor: `${activeProject.color}50`, background: `${activeProject.color}12` }}>
              <span className="w-2 h-2 rounded-full" style={{ background: activeProject.color }} />
              {activeProject.name}
              <button onClick={() => setProjectId(undefined)} className="ml-0.5 opacity-60 hover:opacity-100"><X size={10} /></button>
            </div>
          )}
          {activeTag && (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border" style={{ color: activeTag.color, borderColor: `${activeTag.color}50`, background: `${activeTag.color}12` }}>
              {activeTag.name}
              <button onClick={() => setTagId(undefined)} className="ml-0.5 opacity-60 hover:opacity-100"><X size={10} /></button>
            </div>
          )}
        </div>
      )}

      {/* Priority chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRIORITY_CHIPS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setPriorityFilter(value)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-all",
                priorityFilter === value
                  ? value !== undefined ? PRIORITY_ACTIVE_CLASS[value] : "border-primary/60 text-primary bg-primary/10"
                  : "border-border text-muted hover:text-text"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ViewSwitcher />
          {allTags.length > 0 && (
            <Select value={tagId ?? "all"} onValueChange={(v) => setTagId(!v || v === "all" ? undefined : v)}>
              <SelectTrigger size="sm" className="w-28 sm:w-32">
                <SelectValue placeholder="Тег" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все теги</SelectItem>
                {allTags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: t.color }} />
                      {t.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={orderBy} onValueChange={(v) => setOrderBy(v as OrderBy)}>
            <SelectTrigger size="sm" className="w-36 sm:w-44">
              <SelectValue>{ORDER_BY_LABELS[orderBy]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">По дате создания</SelectItem>
              <SelectItem value="dueDate">По дедлайну</SelectItem>
              <SelectItem value="priority">По приоритету</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => setOrderDir((d) => (d === "asc" ? "desc" : "asc"))}
            title={orderDir === "asc" ? "По возрастанию" : "По убыванию"}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-white/5 text-muted hover:text-text hover:border-primary/40 transition-all"
          >
            {orderDir === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </button>

          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-xs text-muted hover:text-danger transition-colors flex items-center gap-1">
              <X size={12} />
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex items-center gap-1.5 flex-wrap -mt-2">
        {STATUS_CHIPS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setStatusFilter(value)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-all",
              statusFilter === value
                ? value !== undefined ? STATUS_ACTIVE_CLASS[value] : "border-primary/60 text-primary bg-primary/10"
                : "border-border text-muted hover:text-text"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : view === "kanban" ? (
        <KanbanView tasks={tasks} groupBy={kanbanGroupBy} onEdit={setEditTask} onCardClick={setDetailTask} onCreateClick={() => setCreateOpen(true)} />
      ) : view === "matrix" ? (
        <MatrixView tasks={tasks} onEdit={setEditTask} onCardClick={setDetailTask} />
      ) : (
        <TaskList tasks={tasks} onEdit={setEditTask} onCardClick={setDetailTask} onCreateClick={() => setCreateOpen(true)} isDndEnabled={orderBy === "createdAt"} />
      )}

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Новая задача">
        <TaskForm onSuccess={() => setCreateOpen(false)} defaultProjectId={projectId} />
      </FormDialog>

      <FormDialog open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)} title="Редактировать задачу">
        {editTask && <TaskForm task={editTask} onSuccess={() => setEditTask(null)} />}
      </FormDialog>

      <TaskDetailSheet
        task={detailTask}
        open={!!detailTask}
        onOpenChange={(o) => !o && setDetailTask(null)}
        onEdit={(task) => { setDetailTask(null); setEditTask(task); }}
      />

      <ProjectsManager open={projectsOpen} onOpenChange={setProjectsOpen} />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<ListSkeleton count={5} />}>
      <TasksPageInner />
    </Suspense>
  );
}
