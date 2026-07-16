"use client";

import { List, LayoutGrid, Grid2x2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskViewStore } from "@/lib/stores/taskViewStore";
import { cn } from "@/lib/utils";

export function ViewSwitcher() {
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
