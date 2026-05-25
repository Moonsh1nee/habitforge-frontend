import { api } from "./client";
import type { Task, PaginatedResponse } from "@/types";

export interface TaskFilters {
  completed?: boolean;
  priority?: string;
  due_before?: string;
  due_after?: string;
  search?: string;
  order_by?: string;
  order?: "asc" | "desc";
  skip?: number;
  limit?: number;
}

export const tasksApi = {
  getAll: async (filters?: TaskFilters): Promise<PaginatedResponse<Task>> => {
    const { data } = await api.get<PaginatedResponse<Task>>("/tasks/", {
      params: filters,
    });
    return data;
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await api.get<Task>(`/tasks/${id}`);
    return data;
  },

  create: async (
    payload: Partial<Task>
  ): Promise<Task> => {
    const { data } = await api.post<Task>("/tasks/", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Task>): Promise<Task> => {
    const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  bulkComplete: async (ids: string[]): Promise<void> => {
    await api.post("/tasks/bulk-complete", { ids });
  },
};
