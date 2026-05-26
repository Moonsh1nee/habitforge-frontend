import { api } from "./client";
import type { FoodLog, NutritionPlan, DailySummary } from "@/types";

export const nutritionApi = {
  getPlans: async (): Promise<NutritionPlan[]> => {
    const { data } = await api.get<NutritionPlan[]>("/nutrition/plans");
    return Array.isArray(data) ? data : [];
  },

  createPlan: async (payload: Partial<NutritionPlan>): Promise<NutritionPlan> => {
    const { data } = await api.post<NutritionPlan>("/nutrition/plans", payload);
    return data;
  },

  getLogs: async (params?: {
    date?: string;
    start?: string;
    end?: string;
    skip?: number;
    limit?: number;
  }): Promise<FoodLog[]> => {
    const { data } = await api.get<FoodLog[]>("/nutrition/logs", { params });
    return Array.isArray(data) ? data : [];
  },

  createLog: async (payload: Partial<FoodLog>): Promise<FoodLog> => {
    const { data } = await api.post<FoodLog>("/nutrition/logs", payload);
    return data;
  },

  updateLog: async (id: string, payload: Partial<FoodLog>): Promise<FoodLog> => {
    const { data } = await api.patch<FoodLog>(`/nutrition/logs/${id}`, payload);
    return data;
  },

  deleteLog: async (id: string): Promise<void> => {
    await api.delete(`/nutrition/logs/${id}`);
  },

  getSummary: async (date: string): Promise<DailySummary> => {
    const { data } = await api.get<DailySummary>("/nutrition/logs/summary", { params: { date } });
    return data;
  },
};
