import { api } from "./client";
import type { Habit, HabitLog, HabitStats, PaginatedResponse } from "@/types";

export const habitsApi = {
  getAll: async (params?: {
    archived?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Habit>> => {
    const { data } = await api.get<PaginatedResponse<Habit>>("/habits/", {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<Habit> => {
    const { data } = await api.get<Habit>(`/habits/${id}`);
    return data;
  },

  create: async (payload: Partial<Habit>): Promise<Habit> => {
    const { data } = await api.post<Habit>("/habits/", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Habit>): Promise<Habit> => {
    const { data } = await api.patch<Habit>(`/habits/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/habits/${id}`);
  },

  archive: async (id: string): Promise<Habit> => {
    const { data } = await api.patch<Habit>(`/habits/${id}/archive`);
    return data;
  },

  logCompletion: async (
    id: string,
    date?: string,
    count?: number,
    notes?: string
  ): Promise<HabitLog> => {
    const { data } = await api.post<HabitLog>(`/habits/${id}/logs`, {
      date,
      count: count ?? 1,
      notes,
    });
    return data;
  },

  bulkLog: async (id: string, dates: string[]): Promise<void> => {
    await api.post(`/habits/${id}/logs/bulk`, { dates });
  },

  getLogs: async (
    id: string,
    params?: { start?: string; end?: string }
  ): Promise<HabitLog[]> => {
    const { data } = await api.get<HabitLog[]>(`/habits/${id}/logs`, {
      params,
    });
    return data;
  },

  getStats: async (id: string): Promise<HabitStats> => {
    const { data } = await api.get<HabitStats>(`/habits/${id}/stats`);
    return data;
  },
};
