import { api } from "./client";
import type {
  FinanceCategory,
  FinanceTransaction,
  FinanceSummary,
  TransactionType,
} from "@/types";

export interface TransactionFilters {
  type?:        TransactionType;
  category_id?: string;
  date?:        string;
  start?:       string;
  end?:         string;
  skip?:        number;
  limit?:       number;
}

type SummaryParams =
  | { period: "day" | "week" | "month" | "year"; date?: string }
  | { start: string; end: string };

export const financeApi = {
  // ─── Categories ──────────────────────────────────────────────────────────────

  getCategories: async (): Promise<FinanceCategory[]> => {
    const { data } = await api.get<FinanceCategory[]>("/finance/categories");
    return data;
  },

  createCategory: async (payload: {
    name: string;
    icon?: string | null;
    color?: string;
  }): Promise<FinanceCategory> => {
    const { data } = await api.post<FinanceCategory>("/finance/categories", payload);
    return data;
  },

  updateCategory: async (
    id: string,
    payload: { name?: string; icon?: string | null; color?: string }
  ): Promise<FinanceCategory> => {
    const { data } = await api.patch<FinanceCategory>(`/finance/categories/${id}`, payload);
    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/finance/categories/${id}`);
  },

  // ─── Transactions ────────────────────────────────────────────────────────────

  getTransactions: async (params?: TransactionFilters): Promise<FinanceTransaction[]> => {
    const { data } = await api.get<FinanceTransaction[]>("/finance/transactions", { params });
    return data;
  },

  getTransaction: async (id: string): Promise<FinanceTransaction> => {
    const { data } = await api.get<FinanceTransaction>(`/finance/transactions/${id}`);
    return data;
  },

  createTransaction: async (payload: {
    type:         TransactionType;
    amount:       number;
    date?:        string;
    description?: string;
    categoryId?:  string | null;
  }): Promise<FinanceTransaction> => {
    const { data } = await api.post<FinanceTransaction>("/finance/transactions", payload);
    return data;
  },

  updateTransaction: async (
    id: string,
    payload: {
      type?:        TransactionType;
      amount?:      number;
      date?:        string;
      description?: string;
      categoryId?:  string | null;
    }
  ): Promise<FinanceTransaction> => {
    const { data } = await api.patch<FinanceTransaction>(`/finance/transactions/${id}`, payload);
    return data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await api.delete(`/finance/transactions/${id}`);
  },

  // ─── Summary ─────────────────────────────────────────────────────────────────

  getSummary: async (params: SummaryParams): Promise<FinanceSummary> => {
    const { data } = await api.get<FinanceSummary>("/finance/summary", { params });
    return data;
  },
};
