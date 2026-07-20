"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

export function useRecalculateXP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: xpApi.recalculateXP,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["xp"] });
      qc.invalidateQueries({ queryKey: ["achievements"] });
      toast.success("XP пересчитан");
    },
    onError: () => toast.error("Ошибка пересчёта XP"),
  });
}
