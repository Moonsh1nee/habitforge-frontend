"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { budgetsApi, type CreateBudgetPayload } from "@/lib/api/budgets";

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: budgetsApi.getAll,
  });
}

export function useBudgetStatus() {
  return useQuery({
    queryKey: ["budgets", "status"],
    queryFn: budgetsApi.getStatus,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBudgetPayload) => budgetsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Бюджет создан");
    },
    onError: () => toast.error("Не удалось создать бюджет"),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateBudgetPayload> }) =>
      budgetsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Бюджет обновлён");
    },
    onError: () => toast.error("Не удалось обновить бюджет"),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Бюджет удалён");
    },
    onError: () => toast.error("Не удалось удалить бюджет"),
  });
}
