"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";

export function useDashboardToday() {
  return useQuery({
    queryKey: ["dashboard", "today"],
    queryFn: dashboardApi.getToday,
    staleTime: 60_000,
  });
}

export function useDashboardWeek() {
  return useQuery({
    queryKey: ["dashboard", "week"],
    queryFn: dashboardApi.getWeek,
    staleTime: 60_000,
  });
}
