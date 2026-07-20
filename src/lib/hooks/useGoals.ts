"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { goalsApi, type CreateGoalPayload, type UpdateGoalPayload } from "@/lib/api/goals";
import type { GoalStatus } from "@/types";

export function useGoals(status?: GoalStatus) {
  return useQuery({
    queryKey: ["goals", status],
    queryFn: () => goalsApi.getAll(status),
  });
}

export function useGoalTimeline(id: string) {
  return useQuery({
    queryKey: ["goals", id, "timeline"],
    queryFn: () => goalsApi.getTimeline(id),
    enabled: !!id,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGoalPayload) => goalsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Цель создана");
    },
    onError: () => toast.error("Не удалось создать цель"),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGoalPayload }) =>
      goalsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Цель обновлена");
    },
    onError: () => toast.error("Не удалось обновить цель"),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Цель удалена");
    },
    onError: () => toast.error("Не удалось удалить цель"),
  });
}

export function useAddProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value, note }: { id: string; value: number; note?: string }) =>
      goalsApi.addProgress(id, value, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Прогресс обновлён");
    },
    onError: () => toast.error("Не удалось обновить прогресс"),
  });
}
