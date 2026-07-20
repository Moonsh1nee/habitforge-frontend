import { api } from "./client";
import type { Session } from "@/types";

export const sessionsApi = {
  getAll: async (): Promise<Session[]> => {
    const { data } = await api.get<Session[]>("/auth/sessions");
    return data ?? [];
  },

  revoke: async (id: string): Promise<void> => {
    await api.delete(`/auth/sessions/${id}`);
  },

  revokeAll: async (): Promise<void> => {
    await api.delete("/auth/sessions");
  },
};
