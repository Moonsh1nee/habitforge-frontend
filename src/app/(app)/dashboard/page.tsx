"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { TrendingUp, Settings2, GripVertical } from "lucide-react";
import {
  DndContext,
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
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDashboardStore } from "@/lib/stores/dashboardStore";
import { WIDGET_REGISTRY } from "@/components/dashboard/widgetRegistry";
import { DashboardCustomizer } from "@/components/dashboard/DashboardCustomizer";
import { OnboardingBanner } from "@/components/layout/OnboardingBanner";
import { useDashboardToday } from "@/lib/hooks/useDashboard";
import { getGreeting, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Sortable widget shell ─────────────────────────────────────────────────────

function SortableWidget({ id, span }: { id: string; span: "half" | "full" }) {
  const cfg = WIDGET_REGISTRY[id];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  if (!cfg) return null;
  const Component = cfg.component;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
      }}
      className={cn(
        "relative group/widget",
        span === "full" ? "col-span-2" : "col-span-1"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Переместить виджет"
        className="absolute top-2 right-2 z-10 p-1 rounded-md text-muted/0 group-hover/widget:text-muted/50 hover:text-muted! cursor-grab active:cursor-grabbing transition-colors touch-none"
      >
        <GripVertical size={14} />
      </button>
      <Component />
    </div>
  );
}

// ─── Dashboard page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: today } = useDashboardToday();
  const { widgets, setWidgets } = useDashboardStore();
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const visible = widgets.filter((w) => w.visible);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIdx = widgets.findIndex((w) => w.id === active.id);
      const newIdx = widgets.findIndex((w) => w.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return;
      setWidgets(arrayMove(widgets, oldIdx, newIdx));
    },
    [widgets, setWidgets]
  );

  const showBanner =
    (today?.habits?.length ?? 0) === 0 &&
    (today?.tasks_pending?.length ?? 0) === 0 &&
    (today?.tasks_overdue?.length ?? 0) === 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-text">
            {user ? getGreeting(user.firstName) : "Добро пожаловать"}
          </h1>
          <p className="text-muted text-sm mt-0.5 capitalize">
            {formatDate(new Date(), "EEEE, d MMMM")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/tasks"
            className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1"
          >
            <TrendingUp size={13} />
            все задачи
          </Link>
          <button
            onClick={() => setCustomizerOpen(true)}
            title="Настроить дашборд"
            className="h-7 w-7 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors"
          >
            <Settings2 size={15} />
          </button>
        </div>
      </motion.div>

      {today !== undefined && <OnboardingBanner show={showBanner} />}

      {/* Widget grid */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={visible.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-4">
            {visible.map(({ id }) => {
              const cfg = WIDGET_REGISTRY[id];
              if (!cfg) return null;
              return <SortableWidget key={id} id={id} span={cfg.span} />;
            })}
          </div>
        </SortableContext>
      </DndContext>

      <DashboardCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
    </div>
  );
}
