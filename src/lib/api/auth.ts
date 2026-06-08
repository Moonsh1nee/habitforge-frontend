import { api } from "./client";
import type { User } from "@/types";

export interface AuthResponse {
  user: User;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  register: async (
    email: string,
    password: string,
    username: string,
    firstName: string
  ): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
      username,
      firstName,
    });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  logoutAll: async (): Promise<void> => {
    await api.post("/auth/logout/all");
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>("/users/me");
    return data;
  },
};
