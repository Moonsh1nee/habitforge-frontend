import { api } from "./client";
import type { UserXP, UserAchievements } from "@/types";

export const xpApi = {
  getXP: async (): Promise<UserXP> => {
    const { data } = await api.get<UserXP>("/users/me/xp");
    return data;
  },

  recalculateXP: async (): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>("/users/me/xp/recalculate");
    return data;
  },

  getAchievements: async (): Promise<UserAchievements> => {
    const { data } = await api.get<UserAchievements>("/users/me/achievements");
    return data;
  },
};
