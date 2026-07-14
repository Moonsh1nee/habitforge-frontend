import { create } from "zustand";
import { persist } from "zustand/middleware";

type TaskView = "list" | "kanban" | "matrix";
type KanbanGroupBy = "project" | "priority";

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
    { name: "habitforge-task-view" }
  )
);
