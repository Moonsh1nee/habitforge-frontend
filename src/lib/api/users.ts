import { api } from "./client";
import type { User } from "@/types";

export interface AvatarResponse {
  avatarUrl: string;
}

export const usersApi = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>("/users/me");
    return data;
  },

  updateMe: async (payload: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    timezone?: string;
  }): Promise<User> => {
    const { data } = await api.patch<User>("/users/me", payload);
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put("/users/me/password", { currentPassword, newPassword });
  },

  uploadAvatar: async (file: File): Promise<AvatarResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<AvatarResponse>("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  exportData: async (format: "json" | "csv"): Promise<Blob> => {
    const { data } = await api.get("/users/me/export", {
      params: { format },
      responseType: "blob",
    });
    return data;
  },

  deleteAccount: async (currentPassword: string): Promise<void> => {
    await api.delete("/users/me", {
      data: { currentPassword, newPassword: currentPassword },
    });
  },
};
