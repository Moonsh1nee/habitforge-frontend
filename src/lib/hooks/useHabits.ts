"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { habitsApi } from "@/lib/api/habits";
import type { Habit } from "@/types";

export function useHabits(params?: { archived?: boolean }) {
  return useQuery({
    queryKey: ["habits", params],
    queryFn: () => habitsApi.getAll(params),
  });
}

export function useHabit(id: string) {
  return useQuery({
    queryKey: ["habits", id],
    queryFn: () => habitsApi.getById(id),
    enabled: !!id,
  });
}

export function useHabitStats(id: string) {
  return useQuery({
    queryKey: ["habits", id, "stats"],
    queryFn: () => habitsApi.getStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHabitLogs(id: string, params?: { start?: string; end?: string }) {
  return useQuery({
    queryKey: ["habits", id, "logs", params],
    queryFn: () => habitsApi.getLogs(id, params),
    enabled: !!id,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Habit>) => habitsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Привычка создана");
    },
    onError: () => toast.error("Ошибка создания привычки"),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Habit> }) =>
      habitsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
    onError: () => toast.error("Ошибка обновления привычки"),
  });
}

export function useLogHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, note }: { id: string; date?: string; note?: string }) =>
      habitsApi.logCompletion(id, date, note),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["habits", id, "logs"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Привычка отмечена!");
    },
    onError: () => toast.error("Ошибка отметки привычки"),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Привычка удалена");
    },
  });
}

export function useFreezeHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date?: string }) => habitsApi.freeze(id, date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Серия заморожена на 1 день ❄️");
    },
    onError: () => toast.error("Нет доступных заморозок"),
  });
}
