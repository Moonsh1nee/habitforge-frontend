import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DashboardWidget {
  id: string;
  visible: boolean;
}

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "daily-score",   visible: true },
  { id: "quick-metrics", visible: true },
  { id: "today-card",    visible: true },
  { id: "habit-rings",   visible: true },
  { id: "weekly-stats",  visible: true },
  { id: "macros",        visible: true },
  { id: "finance",       visible: true },
  { id: "shopping",      visible: true },
];

interface DashboardState {
  widgets: DashboardWidget[];
  setWidgets: (w: DashboardWidget[]) => void;
  toggleWidget: (id: string) => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,
      setWidgets: (widgets) => set({ widgets }),
      toggleWidget: (id) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, visible: !w.visible } : w
          ),
        })),
      reset: () => set({ widgets: DEFAULT_WIDGETS }),
    }),
    { name: "habitforge-dashboard" }
  )
);
