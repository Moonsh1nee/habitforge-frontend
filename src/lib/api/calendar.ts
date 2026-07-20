import { api } from "./client";
import type { CalendarEvent } from "@/types";

export const calendarApi = {
  getEvents: async (params: { start: string; end: string; types?: string[] }): Promise<CalendarEvent[]> => {
    const { data } = await api.get<CalendarEvent[]>("/calendar/events", { params });
    return data ?? [];
  },
};
