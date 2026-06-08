"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { workoutsApi } from "@/lib/api/workouts";
import type { WorkoutPlan, WorkoutPlanWithExercises, WorkoutLog, WorkoutLogWithExercises, PlanExercise, ExerciseLog } from "@/types";

// ─── Plans ────────────────────────────────────────────────────────────────────

export function useWorkoutPlans() {
  return useQuery({
    queryKey: ["workout-plans"],
    queryFn: workoutsApi.getPlans,
  });
}

export function useWorkoutPlan(id: string) {
  return useQuery<WorkoutPlanWithExercises>({
    queryKey: ["workout-plans", id],
    queryFn: () => workoutsApi.getPlan(id),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<WorkoutPlan>) => workoutsApi.createPlan(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("План создан");
    },
    onError: () => toast.error("Ошибка создания плана"),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<WorkoutPlan> }) =>
      workoutsApi.updatePlan(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("План обновлён");
    },
    onError: () => toast.error("Ошибка обновления плана"),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutsApi.deletePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("План удалён");
    },
    onError: () => toast.error("Ошибка удаления плана"),
  });
}

export function useAddExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, payload }: { planId: string; payload: Partial<PlanExercise> }) =>
      workoutsApi.addExercise(planId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Упражнение добавлено");
    },
    onError: () => toast.error("Ошибка добавления упражнения"),
  });
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export function useWorkoutLogs(params?: { start?: string; end?: string; limit?: number }) {
  return useQuery({
    queryKey: ["workout-logs", params],
    queryFn: () => workoutsApi.getLogs(params),
  });
}

export function useWorkoutLog(id: string) {
  return useQuery<WorkoutLogWithExercises>({
    queryKey: ["workout-logs", id],
    queryFn: () => workoutsApi.getLog(id),
    enabled: !!id,
  });
}

export function useCreateLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<WorkoutLog>) => workoutsApi.createLog(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-logs"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
      toast.success("Тренировка записана");
    },
    onError: () => toast.error("Ошибка создания записи"),
  });
}

export function useUpdateLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<WorkoutLog> }) =>
      workoutsApi.updateLog(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-logs"] });
      toast.success("Тренировка обновлена");
    },
    onError: () => toast.error("Ошибка обновления"),
  });
}

export function useDeleteLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutsApi.deleteLog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-logs"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
      toast.success("Запись удалена");
    },
    onError: () => toast.error("Ошибка удаления"),
  });
}

export function useAddExerciseLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, payload }: { logId: string; payload: Partial<ExerciseLog> }) =>
      workoutsApi.addExerciseLog(logId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-logs"] });
      toast.success("Упражнение добавлено");
    },
    onError: () => toast.error("Ошибка добавления упражнения"),
  });
}

export function useUpdatePlanExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, exerciseId, payload }: { planId: string; exerciseId: string; payload: Partial<PlanExercise> }) =>
      workoutsApi.updatePlanExercise(planId, exerciseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Упражнение обновлено");
    },
    onError: () => toast.error("Ошибка обновления упражнения"),
  });
}

export function useDeletePlanExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, exerciseId }: { planId: string; exerciseId: string }) =>
      workoutsApi.deletePlanExercise(planId, exerciseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Упражнение удалено");
    },
    onError: () => toast.error("Ошибка удаления упражнения"),
  });
}

export function useUpdateLogExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, exerciseId, payload }: { logId: string; exerciseId: string; payload: Partial<ExerciseLog> }) =>
      workoutsApi.updateLogExercise(logId, exerciseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-logs"] });
      toast.success("Упражнение обновлено");
    },
    onError: () => toast.error("Ошибка обновления упражнения"),
  });
}

export function useDeleteLogExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, exerciseId }: { logId: string; exerciseId: string }) =>
      workoutsApi.deleteLogExercise(logId, exerciseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-logs"] });
      toast.success("Упражнение удалено");
    },
    onError: () => toast.error("Ошибка удаления упражнения"),
  });
}
