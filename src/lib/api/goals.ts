import { api } from "./client";
import type { Goal, GoalCategory, GoalStatus, GoalProgress, PaginatedResponse } from "@/types";

export interface CreateGoalPayload {
  title: string;
  description?: string | null;
  category: GoalCategory;
  targetValue: number;
  currentValue?: number;
  unit: string;
  color?: string | null;
  icon?: string | null;
  dueDate?: string | null;
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string | null;
  category?: GoalCategory;
  targetValue?: number;
  unit?: string;
  color?: string | null;
  icon?: string | null;
  dueDate?: string | null;
  status?: GoalStatus;
}

export const goalsApi = {
  getAll: async (status?: GoalStatus): Promise<Goal[]> => {
    const { data } = await api.get<PaginatedResponse<Goal> | Goal[]>("/goals/", {
      params: status ? { goal_status: status } : undefined,
    });
    return Array.isArray(data) ? data : (data as PaginatedResponse<Goal>).items ?? [];
  },

  create: async (payload: CreateGoalPayload): Promise<Goal> => {
    const { data } = await api.post<Goal>("/goals/", payload);
    return data;
  },

  update: async (id: string, payload: UpdateGoalPayload): Promise<Goal> => {
    const { data } = await api.patch<Goal>(`/goals/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },

  addProgress: async (id: string, value: number, note?: string): Promise<GoalProgress> => {
    const { data } = await api.post<GoalProgress>(`/goals/${id}/progress`, { value, note });
    return data;
  },

  getTimeline: async (id: string): Promise<GoalProgress[]> => {
    const { data } = await api.get<GoalProgress[]>(`/goals/${id}/timeline`);
    return data ?? [];
  },
};
