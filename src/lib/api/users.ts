import { api } from "./client";
import type { User } from "@/types";

export const usersApi = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>("/users/me");
    return data;
  },

  updateMe: async (payload: Partial<User>): Promise<User> => {
    const { data } = await api.patch<User>("/users/me", payload);
    return data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await api.put("/users/me/password", { currentPassword, newPassword });
  },
};
