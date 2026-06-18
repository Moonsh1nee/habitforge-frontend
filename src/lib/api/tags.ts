import { api } from "./client";
import type { Tag, Task } from "@/types";

export const tagsApi = {
  getAll: async (): Promise<Tag[]> => {
    const { data } = await api.get<Tag[]>("/tags/");
    return data;
  },

  create: async (payload: { name: string; color?: string }): Promise<Tag> => {
    const { data } = await api.post<Tag>("/tags/", payload);
    return data;
  },

  update: async (id: string, payload: { name?: string; color?: string }): Promise<Tag> => {
    const { data } = await api.patch<Tag>(`/tags/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },

  addToTask: async (taskId: string, tagId: string): Promise<Task> => {
    const { data } = await api.post<Task>(`/tasks/${taskId}/tags`, { tag_id: tagId });
    return data;
  },

  removeFromTask: async (taskId: string, tagId: string): Promise<Task> => {
    const { data } = await api.delete<Task>(`/tasks/${taskId}/tags/${tagId}`);
    return data;
  },
};
