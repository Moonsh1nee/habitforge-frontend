"use client";

import { useQuery } from "@tanstack/react-query";
import { xpApi } from "@/lib/api/xp";

export function useXP() {
  return useQuery({
    queryKey: ["xp"],
    queryFn: xpApi.getXP,
    staleTime: 60_000,
    retry: false,
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: xpApi.getAchievements,
    staleTime: 2 * 60_000,
    retry: false,
  });
}
