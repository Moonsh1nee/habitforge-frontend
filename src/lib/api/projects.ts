import { api } from "./client";
import type { Project, PaginatedResponse } from "@/types";

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await api.get<Project[]>("/projects/");
    return data;
  },

  create: async (payload: { name: string; color?: string; icon?: string }): Promise<Project> => {
    const { data } = await api.post<Project>("/projects/", payload);
    return data;
  },

  update: async (id: string, payload: { name?: string; color?: string; icon?: string }): Promise<Project> => {
    const { data } = await api.patch<Project>(`/projects/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  reorder: async (ids: string[]): Promise<void> => {
    await api.post("/projects/reorder", { ids });
  },
};
