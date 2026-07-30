import { api } from "./client";
import type { CalendarEvent } from "@/types";

export const calendarApi = {
  getEvents: async (params: { start: string; end: string; types?: string[] }): Promise<CalendarEvent[]> => {
    // Backend returns { events: [...] }, not a bare array.
    const { data } = await api.get<{ events: CalendarEvent[] }>("/calendar/events", { params });
    return Array.isArray(data?.events) ? data.events : [];
  },
};
