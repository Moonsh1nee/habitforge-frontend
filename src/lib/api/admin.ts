import { api } from "./client";
import type { User, AdminStats, PaginatedResponse } from "@/types";

export interface AdminUpdateUserPayload {
  plan?: "free" | "pro";
  role?: "user" | "admin";
  is_active?: boolean;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get<AdminStats>("/admin/stats");
    return data;
  },

  getUsers: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get<PaginatedResponse<User>>("/admin/users", { params });
    return data;
  },

  updateUser: async (id: string, payload: AdminUpdateUserPayload): Promise<User> => {
    const { data } = await api.patch<User>(`/admin/users/${id}`, payload);
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};
