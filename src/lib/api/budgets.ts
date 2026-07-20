import { api } from "./client";
import type { Budget, BudgetStatus } from "@/types";

export interface CreateBudgetPayload {
  name: string;
  amount: number;
  period: "monthly" | "weekly" | "yearly";
  categoryId?: string | null;
  startDate: string;
  endDate?: string | null;
}

export const budgetsApi = {
  getAll: async (): Promise<Budget[]> => {
    const { data } = await api.get<Budget[]>("/finance/budgets");
    return data ?? [];
  },

  getStatus: async (): Promise<BudgetStatus[]> => {
    const { data } = await api.get<BudgetStatus[]>("/finance/budgets/status");
    return data ?? [];
  },

  create: async (payload: CreateBudgetPayload): Promise<Budget> => {
    const { data } = await api.post<Budget>("/finance/budgets", payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateBudgetPayload>): Promise<Budget> => {
    const { data } = await api.patch<Budget>(`/finance/budgets/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/finance/budgets/${id}`);
  },
};
