"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { migrateStorageKey } from "@/lib/migrateStorageKey";
import type { DashboardWidgetConfig, WidgetSpan } from "@/types";

migrateStorageKey("habitforge-dashboard", "getgrip-dashboard");

export type DashboardWidget = DashboardWidgetConfig;

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "daily-score",   visible: true,  span: "half" },
  { id: "quick-metrics", visible: true,  span: "full" },
  { id: "today-card",    visible: true,  span: "full" },
  { id: "habit-rings",   visible: true,  span: "half" },
  { id: "weekly-stats",  visible: true,  span: "full" },
  { id: "time-tracking", visible: false, span: "half" },
  { id: "goals",         visible: false, span: "half" },
  { id: "journal-trend", visible: false, span: "half" },
  { id: "achievements",  visible: false, span: "half" },
  { id: "reminders",     visible: false, span: "half" },
  { id: "mini-calendar", visible: false, span: "full" },
  { id: "activity-feed", visible: false, span: "half" },
  { id: "habit-streaks", visible: false, span: "half" },
];

/**
 * Merges a widget list (e.g. loaded from the backend) with DEFAULT_WIDGETS so
 * that newly-added widget types always show up (invisible by default) for
 * users who customized their layout before those widgets existed, instead of
 * silently disappearing from the customizer.
 */
export function mergeWithDefaults(widgets: DashboardWidget[]): DashboardWidget[] {
  const byId = new Map(widgets.map((w) => [w.id, w]));
  const merged = widgets.filter((w) => DEFAULT_WIDGETS.some((d) => d.id === w.id));
  for (const def of DEFAULT_WIDGETS) {
    if (!byId.has(def.id)) merged.push({ ...def, visible: false });
  }
  return merged;
}

interface DashboardState {
  widgets: DashboardWidget[];
  hydrated: boolean;
  hydrate: (widgets: DashboardWidget[] | null) => void;
  setWidgets: (w: DashboardWidget[]) => void;
  toggleWidget: (id: string) => void;
  setWidgetSpan: (id: string, span: WidgetSpan) => void;
  setWidgetSetting: (id: string, key: string, value: unknown) => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,
      hydrated: false,

      // Called once by DashboardHydrator when the user record loads. Backend is
      // the source of truth — null (never customized) falls back to defaults.
      hydrate: (widgets) =>
        set({
          widgets: widgets ? mergeWithDefaults(widgets) : DEFAULT_WIDGETS,
          hydrated: true,
        }),

      setWidgets: (widgets) => set({ widgets }),

      toggleWidget: (id) =>
        set((s) => ({
          widgets: s.widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)),
        })),

      setWidgetSpan: (id, span) =>
        set((s) => ({
          widgets: s.widgets.map((w) => (w.id === id ? { ...w, span } : w)),
        })),

      setWidgetSetting: (id, key, value) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, settings: { ...w.settings, [key]: value } } : w
          ),
        })),

      reset: () => set({ widgets: DEFAULT_WIDGETS }),
    }),
    {
      name: "getgrip-dashboard",
      // Only cache widgets locally for instant first paint before the
      // backend-sourced user record arrives — hydrated flag is intentionally
      // NOT persisted, so DashboardHydrator always re-syncs from the server.
      partialize: (s) => ({ widgets: s.widgets }),
    }
  )
);
