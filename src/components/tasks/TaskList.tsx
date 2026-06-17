"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence } from "motion/react";
import { GripVertical } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus } from "lucide-react";
import type { Task } from "@/types";

const STORAGE_KEY = "habitforge-task-order";

function loadOrder(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveOrder(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function applyOrder(tasks: Task[], savedOrder: string[]): Task[] {
  if (!savedOrder.length) return tasks;
  const orderMap = new Map(savedOrder.map((id, i) => [id, i]));
  return [...tasks].sort((a, b) => {
    const ia = orderMap.get(a.id) ?? Infinity;
    const ib = orderMap.get(b.id) ?? Infinity;
    return ia - ib;
  });
}

// ─── Sortable row ──────────────────────────────────────────────────────────────

function SortableTaskCard({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-1 group/row">
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Перетащить задачу"
        className="flex items-center justify-center px-1 text-muted/30 hover:text-muted cursor-grab active:cursor-grabbing transition-colors opacity-0 group-hover/row:opacity-100 [@media(hover:none)]:opacity-100 touch-none shrink-0"
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">
        <TaskCard task={task} onEdit={onEdit} />
      </div>
    </div>
  );
}

// ─── TaskList ──────────────────────────────────────────────────────────────────

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onCreateClick?: () => void;
}

export function TaskList({ tasks, onEdit, onCreateClick }: TaskListProps) {
  const [ordered, setOrdered] = useState<Task[]>([]);

  useEffect(() => {
    setOrdered(applyOrder(tasks, loadOrder()));
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrdered((prev) => {
      const oldIdx = prev.findIndex((t) => t.id === active.id);
      const newIdx = prev.findIndex((t) => t.id === over.id);
      const next = arrayMove(prev, oldIdx, newIdx);
      saveOrder(next.map((t) => t.id));
      return next;
    });
  }, []);

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare />}
        title="Нет задач"
        description="Создайте первую задачу и начните отслеживать прогресс"
        action={
          onCreateClick ? (
            <Button onClick={onCreateClick} className="gradient-primary text-white gap-2">
              <Plus size={16} />
              Создать задачу
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ordered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {ordered.map((task) => (
              <SortableTaskCard key={task.id} task={task} onEdit={onEdit} />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}
