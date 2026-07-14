"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { useUpdateTask } from "@/lib/hooks/useTasks";
import { useProjects } from "@/lib/hooks/useProjects";
import type { Task, TaskPriority } from "@/types";

// ─── Column configs ────────────────────────────────────────────────────────────

type ColumnId = string; // projectId | "null" for no-project | "1"|"2"|"3" for priority

interface Column {
  id: ColumnId;
  title: string;
  color: string;
  tasks: Task[];
}

const PRIORITY_COLUMNS: Omit<Column, "tasks">[] = [
  { id: "1", title: "Высокий",  color: "#ef4444" },
  { id: "2", title: "Средний",  color: "#f59e0b" },
  { id: "3", title: "Низкий",   color: "#64748b" },
];

// ─── Sortable card inside a Kanban column ─────────────────────────────────────

function KanbanCard({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: "task", task } });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 20 : undefined,
      }}
      className="flex items-stretch gap-1 group/row"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Перетащить"
        className="flex items-center justify-center px-1 text-muted/30 hover:text-muted cursor-grab active:cursor-grabbing opacity-0 group-hover/row:opacity-100 [@media(hover:none)]:opacity-100 touch-none shrink-0"
      >
        <GripVertical size={13} />
      </button>
      <div className="flex-1 min-w-0">
        <TaskCard task={task} onEdit={onEdit} />
      </div>
    </div>
  );
}

// ─── Column droppable area ─────────────────────────────────────────────────────

function KanbanColumn({
  column,
  onEdit,
  onAddTask,
}: {
  column: Column;
  onEdit: (t: Task) => void;
  onAddTask?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column" } });
  const active = column.tasks.filter((t) => !t.completed);
  const done = column.tasks.filter((t) => t.completed);

  return (
    <div className={`w-72 shrink-0 flex flex-col gap-3 rounded-2xl p-3 border transition-colors ${
      isOver ? "bg-primary/8 border-primary/30" : "bg-white/2 border-border"
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: column.color }} />
        <span className="text-sm font-semibold text-text flex-1 truncate">{column.title}</span>
        <span className="text-xs text-muted tabular-nums bg-white/8 px-1.5 py-0.5 rounded-full">
          {active.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-2 overflow-y-auto min-h-20 max-h-[calc(100vh-18rem)]"
      >
        <SortableContext items={active.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {active.map((task) => (
            <KanbanCard key={task.id} task={task} onEdit={onEdit} />
          ))}
        </SortableContext>
        {done.length > 0 && (
          <div className="pt-1 border-t border-border/50">
            {done.map((task) => (
              <div key={task.id} className="opacity-50">
                <TaskCard task={task} onEdit={onEdit} />
              </div>
            ))}
          </div>
        )}
        {active.length === 0 && done.length === 0 && (
          <div className="h-12 rounded-xl border border-dashed border-border/50 flex items-center justify-center">
            <span className="text-xs text-muted/40">Нет задач</span>
          </div>
        )}
      </div>

      {onAddTask && (
        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors px-1 py-1"
        >
          <Plus size={13} />
          Добавить задачу
        </button>
      )}
    </div>
  );
}

// ─── KanbanView ────────────────────────────────────────────────────────────────

interface KanbanViewProps {
  tasks: Task[];
  groupBy: "project" | "priority";
  onEdit: (task: Task) => void;
  onCreateClick?: () => void;
}

export function KanbanView({ tasks, groupBy, onEdit, onCreateClick }: KanbanViewProps) {
  const { data: projects = [] } = useProjects();
  const updateTask = useUpdateTask();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Build columns based on groupBy
  const columns: Column[] = groupBy === "priority"
    ? PRIORITY_COLUMNS.map((col) => ({
        ...col,
        tasks: tasks.filter((t) => String(t.priority) === col.id),
      }))
    : [
        ...projects.map((p) => ({
          id: p.id,
          title: p.name,
          color: p.color,
          tasks: tasks.filter((t) => t.projectId === p.id),
        })),
        {
          id: "null",
          title: "Без проекта",
          color: "#64748b",
          tasks: tasks.filter((t) => t.projectId === null),
        },
      ];

  const allColumnIds = new Set(columns.map((c) => c.id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findColumn = useCallback(
    (taskId: string) => columns.find((c) => c.tasks.some((t) => t.id === taskId)),
    [columns]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const activeTaskId = String(active.id);
      const overId = String(over.id);

      // Determine target column
      let targetColumnId: string;
      if (allColumnIds.has(overId)) {
        // Dropped directly on a column
        targetColumnId = overId;
      } else {
        // Dropped on another task — find its column
        const targetCol = findColumn(overId);
        if (!targetCol) return;
        targetColumnId = targetCol.id;
      }

      const sourceCol = findColumn(activeTaskId);
      if (!sourceCol) return;

      if (sourceCol.id === targetColumnId) {
        // Reorder within same column — local only (no API for kanban order)
        return;
      }

      // Cross-column move — update via API
      if (groupBy === "priority") {
        const newPriority = Number(targetColumnId) as TaskPriority;
        updateTask.mutate({ id: activeTaskId, payload: { priority: newPriority } });
      } else {
        const newProjectId = targetColumnId === "null" ? null : targetColumnId;
        updateTask.mutate({ id: activeTaskId, payload: { projectId: newProjectId } as Partial<Task> });
      }
    },
    [allColumnIds, findColumn, groupBy, updateTask]
  );

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            onEdit={onEdit}
            onAddTask={col.id !== "null" && groupBy === "project" ? onCreateClick : undefined}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="opacity-95 rotate-1 shadow-2xl shadow-black/40">
            <TaskCard task={activeTask} onEdit={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
