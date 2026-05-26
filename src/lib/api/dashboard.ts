import { api } from "./client";
import type { TodayDashboard, WeekStats } from "@/types";

export const dashboardApi = {
  getToday: async (): Promise<TodayDashboard> => {
    const { data } = await api.get<TodayDashboard>("/dashboard/today");
    return data;
  },

  getWeek: async (): Promise<WeekStats> => {
    const { data } = await api.get<WeekStats>("/dashboard/week");
    return data;
  },
};
