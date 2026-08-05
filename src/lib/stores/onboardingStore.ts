"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { migrateStorageKey } from "@/lib/migrateStorageKey";
import {
  CheckSquare, Repeat2,
  BookOpen, BarChart2, Target, Trophy,
} from "lucide-react";

export const ALL_MODULES = [
  "tasks", "habits", "journal", "stats",
  "goals", "achievements",
] as const;

export type AppModule = (typeof ALL_MODULES)[number];

migrateStorageKey("habitforge-modules", "getgrip-modules");

export const MODULES: {
  id: AppModule;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: "tasks",        label: "Задачи",      desc: "Проекты, теги, дедлайны",       icon: CheckSquare,  color: "#7c3aed" },
  { id: "habits",       label: "Привычки",    desc: "Стрики, хитмап, заморозки",     icon: Repeat2,      color: "#06b6d4" },
  { id: "goals",        label: "Цели",        desc: "Целевые значения, прогресс",    icon: Target,       color: "#a855f7" },
  { id: "journal",      label: "Дневник",     desc: "Настроение, сон, заметки",      icon: BookOpen,     color: "#8b5cf6" },
  { id: "stats",        label: "Аналитика",   desc: "Графики по всем модулям",       icon: BarChart2,    color: "#ec4899" },
  { id: "achievements", label: "Достижения",  desc: "XP, уровни, ачивменты",         icon: Trophy,       color: "#f97316" },
];

interface OnboardingState {
  modules: AppModule[];
  hydrated: boolean;
  hydrate: (modules: AppModule[] | null) => void;
  setModules: (modules: AppModule[]) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      modules: [...ALL_MODULES],
      hydrated: false,

      // Backend is the source of truth — null (never customized, or account
      // predates this field) falls back to "everything enabled".
      hydrate: (modules) =>
        set({
          modules: modules && modules.length > 0 ? modules : [...ALL_MODULES],
          hydrated: true,
        }),

      setModules: (modules) => set({ modules }),
    }),
    {
      name: "getgrip-modules",
      partialize: (s) => ({ modules: s.modules }),
    }
  )
);
