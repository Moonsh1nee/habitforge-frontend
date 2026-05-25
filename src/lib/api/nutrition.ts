import { api } from "./client";
import type { FoodLog, NutritionPlan, NutritionSummary } from "@/types";

export const nutritionApi = {
  getPlans: async (): Promise<NutritionPlan[]> => {
    const { data } = await api.get<NutritionPlan[]>("/nutrition/plans");
    return data;
  },

  createPlan: async (
    payload: Partial<NutritionPlan>
  ): Promise<NutritionPlan> => {
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
    return data;
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

  getSummary: async (date: string): Promise<NutritionSummary> => {
    const { data } = await api.get<NutritionSummary>(
      "/nutrition/logs/summary",
      { params: { date } }
    );
    return data;
  },

  getStats: async (params: {
    start: string;
    end: string;
  }): Promise<{ date: string; calories: number; protein: number }[]> => {
    const { data } = await api.get("/nutrition/stats", { params });
    return data;
  },
};
