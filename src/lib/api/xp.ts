import { api } from "./client";
import type { UserXP, Achievement, UserAchievements } from "@/types";

export const xpApi = {
  getXP: async (): Promise<UserXP> => {
    const { data } = await api.get<UserXP>("/users/me/xp");
    return data;
  },

  recalculateXP: async (): Promise<UserXP> => {
    const { data } = await api.post<UserXP>("/users/me/xp/recalculate");
    return data;
  },

  getAchievements: async (): Promise<UserAchievements> => {
    const { data } = await api.get<UserAchievements>("/users/me/achievements");
    return data;
  },

  getAchievement: async (id: string): Promise<Achievement> => {
    const { data } = await api.get<Achievement>(`/users/me/achievements/${id}`);
    return data;
  },
};
