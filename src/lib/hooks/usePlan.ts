"use client";

import { usePlanStore } from "@/lib/stores/planStore";

export type PlanFeature = "habits" | "projects" | "tags";

export function usePlan() {
  const { plan, limits } = usePlanStore();

  const isPro = plan === "pro";

  const isAtLimit = (feature: PlanFeature, count: number): boolean => {
    if (isPro) return false;
    return count >= limits[feature];
  };

  const canUse = (feature: PlanFeature, count: number): boolean => {
    return !isAtLimit(feature, count);
  };

  const getLimit = (feature: PlanFeature): number => limits[feature];

  return { plan, isPro, limits, isAtLimit, canUse, getLimit };
}
