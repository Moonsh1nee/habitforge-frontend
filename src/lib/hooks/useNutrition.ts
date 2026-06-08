"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { nutritionApi } from "@/lib/api/nutrition";
import type { FoodLog, NutritionPlan, MealTemplate } from "@/types";

// ─── Diary ────────────────────────────────────────────────────────────────────

export function useNutritionSummary(date: string) {
  return useQuery({
    queryKey: ["nutrition", "summary", date],
    queryFn: () => nutritionApi.getSummary(date),
    enabled: !!date,
  });
}

export function useNutritionLogs(date: string) {
  return useQuery({
    queryKey: ["nutrition", "logs", date],
    queryFn: () => nutritionApi.getLogs({ date }),
    enabled: !!date,
  });
}

export function useCreateNutritionLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<FoodLog>) => nutritionApi.createLog(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
      toast.success("Еда добавлена!");
    },
    onError: () => toast.error("Ошибка добавления еды"),
  });
}

export function useDeleteNutritionLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => nutritionApi.deleteLog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
    },
    onError: () => toast.error("Ошибка удаления записи"),
  });
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export function useNutritionPlans(enabled = true) {
  return useQuery({
    queryKey: ["nutrition-plans"],
    queryFn: nutritionApi.getPlans,
    enabled,
  });
}

export function usePlanMeals(planId: string, enabled = true) {
  return useQuery({
    queryKey: ["nutrition-plan-meals", planId],
    queryFn: () => nutritionApi.getPlanMeals(planId),
    enabled: !!planId && enabled,
  });
}

export function useCreateNutritionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<NutritionPlan>) => nutritionApi.createPlan(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition-plans"] });
      toast.success("План создан");
    },
    onError: () => toast.error("Ошибка создания плана"),
  });
}

export function useUpdateNutritionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<NutritionPlan> }) =>
      nutritionApi.updatePlan(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition-plans"] });
      toast.success("План обновлён");
    },
    onError: () => toast.error("Ошибка обновления плана"),
  });
}

export function useDeleteNutritionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => nutritionApi.deletePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition-plans"] });
      toast.success("План удалён");
    },
    onError: () => toast.error("Ошибка удаления плана"),
  });
}

export function useAddPlanMeal(planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<MealTemplate>) => nutritionApi.addPlanMeal(planId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition-plan-meals", planId] });
      toast.success("Шаблон добавлен");
    },
    onError: () => toast.error("Ошибка создания шаблона"),
  });
}

export function useUpdatePlanMeal(planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mealId, payload }: { mealId: string; payload: Partial<MealTemplate> }) =>
      nutritionApi.updatePlanMeal(planId, mealId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition-plan-meals", planId] });
      toast.success("Шаблон обновлён");
    },
    onError: () => toast.error("Ошибка обновления шаблона"),
  });
}

export function useDeletePlanMeal(planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mealId: string) => nutritionApi.deletePlanMeal(planId, mealId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition-plan-meals", planId] });
      toast.success("Шаблон удалён");
    },
    onError: () => toast.error("Ошибка удаления шаблона"),
  });
}