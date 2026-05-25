import { api } from "./client";
import type { DashboardToday, DashboardWeek } from "@/types";

export const dashboardApi = {
  getToday: async (): Promise<DashboardToday> => {
    const { data } = await api.get<DashboardToday>("/dashboard/today");
    return data;
  },

  getWeek: async (): Promise<DashboardWeek> => {
    const { data } = await api.get<DashboardWeek>("/dashboard/week");
    return data;
  },
};
