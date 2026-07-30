import { create } from "zustand";
import { persist } from "zustand/middleware";
import { migrateStorageKey } from "@/lib/migrateStorageKey";

migrateStorageKey("habitforge-task-view", "getgrip-task-view");

type TaskView = "list" | "kanban" | "matrix";
type KanbanGroupBy = "project" | "priority" | "status";

interface TaskViewState {
  view: TaskView;
  kanbanGroupBy: KanbanGroupBy;
  setView: (v: TaskView) => void;
  setKanbanGroupBy: (g: KanbanGroupBy) => void;
}

export const useTaskViewStore = create<TaskViewState>()(
  persist(
    (set) => ({
      view: "list",
      kanbanGroupBy: "project",
      setView: (view) => set({ view }),
      setKanbanGroupBy: (kanbanGroupBy) => set({ kanbanGroupBy }),
    }),
    { name: "getgrip-task-view" }
  )
);
