"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { financeApi, type TransactionFilters } from "@/lib/api/finance";
import type { FinanceCategory, FinanceTransaction, TransactionType } from "@/types";

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ["finance-categories"],
    queryFn: financeApi.getCategories,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; icon?: string | null; color?: string }) =>
      financeApi.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance-categories"] });
      toast.success("Категория создана");
    },
    onError: () => toast.error("Ошибка создания категории"),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; icon?: string | null; color?: string };
    }) => financeApi.updateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance-categories"] });
      toast.success("Категория обновлена");
    },
    onError: () => toast.error("Ошибка обновления"),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance-categories"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
      toast.success("Категория удалена");
    },
    onError: () => toast.error("Ошибка удаления"),
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useTransactions(params?: TransactionFilters) {
  return useQuery({
    queryKey: ["finance-transactions", params],
    queryFn: () => financeApi.getTransactions(params),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      type:         TransactionType;
      amount:       number;
      date?:        string;
      description?: string;
      categoryId?:  string | null;
    }) => financeApi.createTransaction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance-transactions"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
      toast.success("Транзакция добавлена");
    },
    onError: () => toast.error("Ошибка добавления транзакции"),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof financeApi.updateTransaction>[1];
    }) => financeApi.updateTransaction(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance-transactions"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
      toast.success("Транзакция обновлена");
    },
    onError: () => toast.error("Ошибка обновления"),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance-transactions"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
      toast.success("Транзакция удалена");
    },
    onError: () => toast.error("Ошибка удаления"),
  });
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export function useFinanceSummary(
  params: { period: "day" | "week" | "month" | "year"; date?: string } | { start: string; end: string }
) {
  return useQuery({
    queryKey: ["finance-summary", params],
    queryFn: () => financeApi.getSummary(params),
  });
}
