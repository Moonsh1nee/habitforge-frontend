"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, ArrowUp, ArrowDown, X, FolderOpen, Pencil, Trash2, List, LayoutGrid, Grid2x2 } from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/lib/hooks/useProjects";
import { useTags } from "@/lib/hooks/useTags";
import { TaskList } from "@/components/tasks/TaskList";
import { KanbanView } from "@/components/tasks/KanbanView";
import { MatrixView } from "@/components/tasks/MatrixView";
import { TaskForm } from "@/components/tasks/TaskForm";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePlan } from "@/lib/hooks/usePlan";
import { LimitBadge } from "@/components/shared/LimitBadge";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, Project } from "@/types";
import type { TaskFilters } from "@/lib/api/tasks";

type OrderBy = "createdAt" | "dueDate" | "priority";

const PRIORITY_CHIPS: { label: string; value: TaskPriority | undefined }[] = [
  { label: "Все", value: undefined },
  { label: "Высокий", value: 1 },
  { label: "Средний", value: 2 },
  { label: "Низкий", value: 3 },
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

const PRESET_COLORS = [
  "#7c3aed", "#8b5cf6", "#06b6d4", "#0ea5e9",
  "#22c55e", "#f59e0b", "#f97316", "#ef4444",
  "#ec4899", "#64748b",
];

// ─── Color picker ─────────────────────────────────────────────────────────────

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "w-6 h-6 rounded-full transition-all shrink-0",
            value === c
              ? "ring-2 ring-offset-2 ring-offset-background ring-white scale-110"
              : "hover:scale-110"
          )}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

// ─── Projects manager ─────────────────────────────────────────────────────────

function ProjectsManager({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: projects = [] } = useProjects();
  const create = useCreateProject();
  const { isAtLimit, getLimit } = usePlan();
  const atProjectLimit = isAtLimit("projects", projects.length);
  const projectLimit = getLimit("projects");
  const update = useUpdateProject();
  const del = useDeleteProject();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    create.mutate(
      { name: newName.trim(), color: newColor },
      { onSuccess: () => { setNewName(""); setNewColor(PRESET_COLORS[0]); } }
    );
  };

  const startEdit = (p: Project) => {
    setEditId(p.id);
    setEditName(p.name);
    setEditColor(p.color);
  };

  const handleUpdate = () => {
    if (!editId || !editName.trim()) return;
    update.mutate(
      { id: editId, payload: { name: editName.trim(), color: editColor } },
      { onSuccess: () => setEditId(null) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Управление проектами</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {projects.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">Пока нет проектов</p>
          ) : projects.map((p) =>
            editId === p.id ? (
              <div key={p.id} className="space-y-3 p-3 rounded-xl bg-white/5 border border-border">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                  autoFocus
                />
                <ColorPicker value={editColor} onChange={setEditColor} />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={!editName.trim() || update.isPending}
                    className="bg-primary text-white"
                  >
                    Сохранить
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group transition-colors"
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="flex-1 text-sm text-text truncate">{p.name}</span>
                {p.tasksCount > 0 && (
                  <span className="text-xs text-muted tabular-nums shrink-0">
                    {p.tasksDone}/{p.tasksCount}
                  </span>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => startEdit(p)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить «{p.name}»?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Задачи в проекте не удаляются — они просто открепятся от него.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => del.mutate(p.id)}
                          className="bg-danger text-white hover:bg-danger/80"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          )}
        </div>

        {/* Create form */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted font-medium uppercase tracking-wide">Новый проект</p>
            <LimitBadge current={projects.length} max={projectLimit} label="проектов" />
          </div>
          {atProjectLimit ? (
            <p className="text-xs text-muted text-center py-2">
              Лимит {projectLimit} проектов на Free.{" "}
              <a href="/upgrade" className="text-primary hover:underline">Перейти на Pro →</a>
            </p>
          ) : (
            <>
              <Input
                placeholder="Название проекта"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <ColorPicker value={newColor} onChange={setNewColor} />
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || create.isPending}
                className="bg-primary text-white w-full gap-2"
              >
                <Plus size={14} />
                Создать проект
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tasks page ───────────────────────────────────────────────────────────────

function ViewSwitcher() {
  const { view, setView, kanbanGroupBy, setKanbanGroupBy } = useTaskViewStore();
  return (
    <div className="flex items-center gap-1">
      {([
        { id: "list",   Icon: List,       title: "Список" },
        { id: "kanban", Icon: LayoutGrid, title: "Канбан" },
        { id: "matrix", Icon: Grid2x2,    title: "Матрица" },
      ] as const).map(({ id, Icon, title }) => (
        <button
          key={id}
          title={title}
          onClick={() => setView(id)}
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded-md border transition-all",
            view === id
              ? "border-primary/60 bg-primary/10 text-primary"
              : "border-border bg-white/5 text-muted hover:text-text hover:border-primary/30"
          )}
        >
          <Icon size={15} />
        </button>
      ))}
      {view === "kanban" && (
        <Select
          value={kanbanGroupBy}
          onValueChange={(v) => v && setKanbanGroupBy(v as "project" | "priority")}
        >
          <SelectTrigger size="sm" className="w-36 ml-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="project">По проектам</SelectItem>
            <SelectItem value="priority">По приоритету</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function TasksPageInner() {
  const searchParams = useSearchParams();
  const urlProjectId: string | undefined = searchParams.get("project_id") ?? undefined;
  const urlTagId: string | undefined = searchParams.get("tag_id") ?? undefined;
  const urlCreate = searchParams.get("create");

  const { view, kanbanGroupBy } = useTaskViewStore();

  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | undefined>(urlProjectId);
  const [tagId, setTagId] = useState<string | undefined>(urlTagId);
  const [orderBy, setOrderBy] = useState<OrderBy>("createdAt");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
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
    search !== "" ||
    projectId !== undefined ||
    tagId !== undefined ||
    orderBy !== "createdAt" ||
    orderDir !== "desc";

  const resetFilters = () => {
    setPriorityFilter(undefined);
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

      {/* Search */}
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

      {/* Active project / tag badges */}
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

      {/* Priority chips + tag filter + sort */}
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
          {/* Tag filter select */}
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

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : view === "kanban" ? (
        <KanbanView tasks={tasks} groupBy={kanbanGroupBy} onEdit={setEditTask} onCreateClick={() => setCreateOpen(true)} />
      ) : view === "matrix" ? (
        <MatrixView tasks={tasks} onEdit={setEditTask} />
      ) : (
        <TaskList tasks={tasks} onEdit={setEditTask} onCreateClick={() => setCreateOpen(true)} isDndEnabled={orderBy === "createdAt"} />
      )}

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Новая задача">
        <TaskForm onSuccess={() => setCreateOpen(false)} defaultProjectId={projectId} />
      </FormDialog>

      <FormDialog open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)} title="Редактировать задачу">
        {editTask && <TaskForm task={editTask} onSuccess={() => setEditTask(null)} />}
      </FormDialog>

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
