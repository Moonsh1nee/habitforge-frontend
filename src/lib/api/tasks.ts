import { api } from "./client";
import type { Task, PaginatedResponse } from "@/types";

export interface TaskFilters {
  completed?: boolean;
  priority?: 1 | 2 | 3;
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
    const { data } = await api.get<Task[] | PaginatedResponse<Task>>("/tasks/", {
      params: filters,
    });
    if (Array.isArray(data)) {
      return { items: data, total: data.length, skip: 0, limit: data.length };
    }
    return data;
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await api.get<Task>(`/tasks/${id}`);
    return data;
  },

  create: async (payload: Partial<Task>): Promise<Task> => {
    const { data } = await api.post<Task>("/tasks/", {
      title: payload.title,
      ...(payload.description !== undefined && { description: payload.description }),
      priority: payload.priority ?? 2,
      ...(payload.completed !== undefined && { completed: payload.completed }),
      dueDate: payload.dueDate ?? null,
      isRecurring: payload.isRecurring ?? false,
      recurrence: payload.recurrence ?? null,
    });
    return data;
  },

  update: async (id: string, payload: Partial<Task>): Promise<Task> => {
    const { data } = await api.patch<Task>(`/tasks/${id}`, {
      ...(payload.title !== undefined && { title: payload.title }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.priority !== undefined && { priority: payload.priority }),
      ...(payload.completed !== undefined && { completed: payload.completed }),
      ...(payload.dueDate !== undefined && { dueDate: payload.dueDate }),
      ...(payload.isRecurring !== undefined && { isRecurring: payload.isRecurring }),
      ...(payload.recurrence !== undefined && { recurrence: payload.recurrence }),
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  bulkComplete: async (ids: string[]): Promise<void> => {
    await api.post("/tasks/bulk-complete", { ids });
  },
};
