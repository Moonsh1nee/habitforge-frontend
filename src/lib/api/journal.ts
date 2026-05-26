import { api } from "./client";
import type { DailyEntry, JournalStats } from "@/types";

export const journalApi = {
  getEntries: async (params?: {
    start?: string;
    end?: string;
    skip?: number;
    limit?: number;
  }): Promise<DailyEntry[]> => {
    const { data } = await api.get<DailyEntry[]>("/journal/entries", { params });
    return Array.isArray(data) ? data : [];
  },

  getEntry: async (date: string): Promise<DailyEntry> => {
    const { data } = await api.get<DailyEntry>(`/journal/entries/${date}`);
    return data;
  },

  createEntry: async (payload: Partial<DailyEntry>): Promise<DailyEntry> => {
    const { data } = await api.post<DailyEntry>("/journal/entries", payload);
    return data;
  },

  updateEntry: async (date: string, payload: Partial<DailyEntry>): Promise<DailyEntry> => {
    const { data } = await api.patch<DailyEntry>(`/journal/entries/${date}`, payload);
    return data;
  },

  deleteEntry: async (date: string): Promise<void> => {
    await api.delete(`/journal/entries/${date}`);
  },

  getStats: async (params?: { start?: string; end?: string }): Promise<JournalStats> => {
    const { data } = await api.get<JournalStats>("/journal/stats", { params });
    return data;
  },
};
