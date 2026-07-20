"use client";

import { useQuery } from "@tanstack/react-query";
import { calendarApi } from "@/lib/api/calendar";

export function useCalendarEvents(params: { start: string; end: string; types?: string[] }) {
  return useQuery({
    queryKey: ["calendar-events", params.start, params.end, params.types],
    queryFn: () => calendarApi.getEvents(params),
    enabled: !!params.start && !!params.end,
    staleTime: 60_000,
  });
}
