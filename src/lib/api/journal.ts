import { api } from "./client";
import type { JournalEntry, JournalStats } from "@/types";

export const journalApi = {
  getEntries: async (params?: {
    start?: string;
    end?: string;
    skip?: number;
    limit?: number;
  }): Promise<JournalEntry[]> => {
    const { data } = await api.get<JournalEntry[]>("/journal/entries", {
      params,
    });
    return data;
  },

  getEntry: async (date: string): Promise<JournalEntry> => {
    const { data } = await api.get<JournalEntry>(`/journal/entries/${date}`);
    return data;
  },

  createEntry: async (
    payload: Partial<JournalEntry>
  ): Promise<JournalEntry> => {
    const { data } = await api.post<JournalEntry>("/journal/entries", payload);
    return data;
  },

  updateEntry: async (
    date: string,
    payload: Partial<JournalEntry>
  ): Promise<JournalEntry> => {
    const { data } = await api.patch<JournalEntry>(
      `/journal/entries/${date}`,
      payload
    );
    return data;
  },

  deleteEntry: async (date: string): Promise<void> => {
    await api.delete(`/journal/entries/${date}`);
  },

  getStats: async (params: {
    start: string;
    end: string;
  }): Promise<JournalStats> => {
    const { data } = await api.get<JournalStats>("/journal/stats", { params });
    return data;
  },
};
