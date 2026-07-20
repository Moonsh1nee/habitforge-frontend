import { api } from "./client";
import type { UserXP, Achievement, UserAchievements } from "@/types";

export const xpApi = {
  getXP: async (): Promise<UserXP> => {
    const { data } = await api.get<UserXP>("/xp");
    return data;
  },

  getAchievements: async (): Promise<UserAchievements> => {
    const { data } = await api.get<UserAchievements>("/achievements");
    return data;
  },

  getAchievement: async (id: string): Promise<Achievement> => {
    const { data } = await api.get<Achievement>(`/achievements/${id}`);
    return data;
  },
};
