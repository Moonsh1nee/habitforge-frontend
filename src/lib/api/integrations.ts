import { api } from "./client";
import type { GoogleCalendarStatus } from "@/types";

export const integrationsApi = {
  googleAuth: async (): Promise<{ url: string }> => {
    const { data } = await api.get<{ url: string }>("/integrations/google/auth");
    return data;
  },

  googleStatus: async (): Promise<GoogleCalendarStatus> => {
    const { data } = await api.get<GoogleCalendarStatus>("/integrations/google/status");
    return data;
  },

  googleSync: async (): Promise<{ status: string; syncedAt: string }> => {
    const { data } = await api.post<{ status: string; syncedAt: string }>("/integrations/google/sync");
    return data;
  },

  googleDisconnect: async (): Promise<void> => {
    await api.delete("/integrations/google");
  },
};
