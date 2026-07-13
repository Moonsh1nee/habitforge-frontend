import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CheckSquare, Repeat2, Wallet, Dumbbell, Apple,
  BookOpen, ShoppingCart, BarChart2,
} from "lucide-react";

export const ALL_MODULES = [
  "tasks", "habits", "finance", "workouts", "nutrition", "journal", "shopping", "stats",
] as const;

export type AppModule = (typeof ALL_MODULES)[number];

export const MODULES: {
  id: AppModule;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: "tasks",     label: "Задачи",     desc: "Проекты, теги, дедлайны",       icon: CheckSquare,  color: "#7c3aed" },
  { id: "habits",    label: "Привычки",   desc: "Стрики, хитмап, заморозки",     icon: Repeat2,      color: "#06b6d4" },
  { id: "finance",   label: "Финансы",    desc: "Доходы, расходы, категории",    icon: Wallet,       color: "#22c55e" },
  { id: "workouts",  label: "Тренировки", desc: "Планы упражнений, логи",        icon: Dumbbell,     color: "#f59e0b" },
  { id: "nutrition", label: "Питание",    desc: "Калории, макросы, план",        icon: Apple,        color: "#ef4444" },
  { id: "journal",   label: "Дневник",    desc: "Настроение, сон, заметки",      icon: BookOpen,     color: "#8b5cf6" },
  { id: "shopping",  label: "Покупки",    desc: "Списки покупок + финансы",      icon: ShoppingCart, color: "#0ea5e9" },
  { id: "stats",     label: "Аналитика",  desc: "Графики по всем модулям",       icon: BarChart2,    color: "#ec4899" },
];

interface OnboardingState {
  modules: AppModule[];
  setModules: (modules: AppModule[]) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      modules: [...ALL_MODULES],
      setModules: (modules) => set({ modules }),
    }),
    { name: "habitforge-modules" }
  )
);
