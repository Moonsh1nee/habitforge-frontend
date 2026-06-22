import { api } from "./client";
import type { Goal, GoalCategory, GoalStatus } from "@/types";

export interface CreateGoalPayload {
  title: string;
  category: GoalCategory;
  targetValue: number;
  currentValue?: number;
  unit: string;
  dueDate?: string | null;
}

export interface UpdateGoalPayload {
  title?: string;
  category?: GoalCategory;
  targetValue?: number;
  unit?: string;
  dueDate?: string | null;
  status?: GoalStatus;
}

export const goalsApi = {
  getAll: async (status?: GoalStatus): Promise<Goal[]> => {
    const { data } = await api.get<Goal[]>("/goals", {
      params: status ? { status } : undefined,
    });
    return data;
  },

  create: async (payload: CreateGoalPayload): Promise<Goal> => {
    const { data } = await api.post<Goal>("/goals", payload);
    return data;
  },

  update: async (id: string, payload: UpdateGoalPayload): Promise<Goal> => {
    const { data } = await api.patch<Goal>(`/goals/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },

  addProgress: async (id: string, value: number, note?: string): Promise<Goal> => {
    const { data } = await api.post<Goal>(`/goals/${id}/progress`, { value, note });
    return data;
  },
};
