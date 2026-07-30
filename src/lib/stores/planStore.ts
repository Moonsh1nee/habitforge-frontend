import { create } from "zustand";
import { persist } from "zustand/middleware";
import { migrateStorageKey } from "@/lib/migrateStorageKey";

migrateStorageKey("habitforge-plan", "getgrip-plan");

export type UserPlan = "free" | "pro";

interface PlanLimits {
  habits: number;
  projects: number;
  tags: number;
}

const FREE_LIMITS: PlanLimits = { habits: 5, projects: 3, tags: 5 };
const PRO_LIMITS: PlanLimits = { habits: Infinity, projects: Infinity, tags: Infinity };

interface PlanState {
  plan: UserPlan;
  limits: PlanLimits;
  setPlan: (plan: UserPlan) => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plan: "free",
      limits: FREE_LIMITS,
      setPlan: (plan) => set({ plan, limits: plan === "pro" ? PRO_LIMITS : FREE_LIMITS }),
    }),
    { name: "getgrip-plan" }
  )
);
