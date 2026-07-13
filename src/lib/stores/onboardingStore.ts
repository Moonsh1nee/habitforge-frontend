import { create } from "zustand";
import { persist } from "zustand/middleware";

export const ALL_MODULES = [
  "tasks", "habits", "finance", "workouts", "nutrition", "journal", "shopping", "stats",
] as const;

export type AppModule = (typeof ALL_MODULES)[number];

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
