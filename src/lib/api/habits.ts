import { api } from "./client";
import type { Habit, HabitLog, HabitStats, PaginatedResponse } from "@/types";

export const habitsApi = {
  getAll: async (params?: {
    archived?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Habit>> => {
    const { data } = await api.get<Habit[] | PaginatedResponse<Habit>>("/habits/", { params });
    if (Array.isArray(data)) {
      return { items: data, total: data.length, skip: 0, limit: data.length };
    }
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
    const { data } = await api.put<Habit>(`/habits/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/habits/${id}`);
  },

  archive: async (id: string): Promise<Habit> => {
    const { data } = await api.patch<Habit>(`/habits/${id}/archive`);
    return data;
  },

  logCompletion: async (id: string, date?: string, note?: string): Promise<HabitLog> => {
    const { data } = await api.post<HabitLog>(`/habits/${id}/logs`, { date, note });
    return data;
  },

  deleteLog: async (habitId: string, logDate: string): Promise<void> => {
    await api.delete(`/habits/${habitId}/logs/${logDate}`);
  },

  bulkLog: async (id: string, dates: string[], note?: string): Promise<HabitLog[]> => {
    const { data } = await api.post<HabitLog[]>(`/habits/${id}/logs/bulk`, { dates, note });
    return data;
  },

  getLogs: async (id: string, params?: { start?: string; end?: string }): Promise<HabitLog[]> => {
    const { data } = await api.get<HabitLog[]>(`/habits/${id}/logs`, { params });
    return data;
  },

  getStats: async (id: string, params?: { start?: string; end?: string }): Promise<HabitStats> => {
    const { data } = await api.get<HabitStats>(`/habits/${id}/stats`, { params });
    return data;
  },
};
