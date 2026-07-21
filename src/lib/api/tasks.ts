import { api } from "./client";
import type { Task, TaskComment, TaskActivity, TimeEntry, TimerStatus, TimeTrackingToday, PaginatedResponse } from "@/types";

export interface TaskFilters {
  completed?: boolean;
  priority?: 1 | 2 | 3;
  status?: string;
  goal_id?: string;
  due_before?: string;
  due_after?: string;
  search?: string;
  order_by?: string;
  order?: "asc" | "desc";
  skip?: number;
  limit?: number;
  project_id?: string;
  tag_id?: string;
  include_subtasks?: boolean;
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

  create: async (payload: Partial<Task>): Promise<Task> => {
    const { data } = await api.post<Task>("/tasks/", {
      title: payload.title,
      ...(payload.description !== undefined && { description: payload.description }),
      priority: payload.priority ?? 2,
      ...(payload.status !== undefined && { status: payload.status }),
      ...(payload.icon !== undefined && { icon: payload.icon }),
      ...(payload.coverColor !== undefined && { coverColor: payload.coverColor }),
      ...(payload.estimatedMinutes !== undefined && { estimatedMinutes: payload.estimatedMinutes }),
      ...(payload.completed !== undefined && { completed: payload.completed }),
      dueDate: payload.dueDate ?? null,
      isRecurring: payload.isRecurring ?? false,
      recurrence: payload.recurrence ?? null,
      ...(payload.projectId !== undefined && { projectId: payload.projectId }),
      ...(payload.goalId !== undefined && { goalId: payload.goalId }),
    });
    return data;
  },

  update: async (id: string, payload: Partial<Task>): Promise<Task> => {
    const { data } = await api.patch<Task>(`/tasks/${id}`, {
      ...(payload.title !== undefined && { title: payload.title }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.priority !== undefined && { priority: payload.priority }),
      ...(payload.status !== undefined && { status: payload.status }),
      ...(payload.completed !== undefined && { completed: payload.completed }),
      ...(payload.dueDate !== undefined && { dueDate: payload.dueDate }),
      ...(payload.isRecurring !== undefined && { isRecurring: payload.isRecurring }),
      ...(payload.recurrence !== undefined && { recurrence: payload.recurrence }),
      ...(payload.projectId !== undefined && { projectId: payload.projectId }),
      ...(payload.icon !== undefined && { icon: payload.icon }),
      ...(payload.coverColor !== undefined && { coverColor: payload.coverColor }),
      ...(payload.estimatedMinutes !== undefined && { estimatedMinutes: payload.estimatedMinutes }),
      ...(payload.goalId !== undefined && { goalId: payload.goalId }),
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  bulkComplete: async (ids: string[]): Promise<Task[]> => {
    const { data } = await api.post<Task[]>("/tasks/bulk-complete", { ids });
    return data;
  },

  reorder: async (ids: string[]): Promise<void> => {
    await api.post("/tasks/reorder", { ids });
  },

  getSubtasks: async (taskId: string): Promise<Task[]> => {
    const { data } = await api.get<Task[]>(`/tasks/${taskId}/subtasks`);
    return data;
  },

  createSubtask: async (taskId: string, payload: { title: string; priority?: number }): Promise<Task> => {
    const { data } = await api.post<Task>(`/tasks/${taskId}/subtasks`, payload);
    return data;
  },

  getComments: async (taskId: string): Promise<TaskComment[]> => {
    const { data } = await api.get<TaskComment[]>(`/tasks/${taskId}/comments`);
    return data;
  },

  createComment: async (taskId: string, body: string): Promise<TaskComment> => {
    const { data } = await api.post<TaskComment>(`/tasks/${taskId}/comments`, { body });
    return data;
  },

  updateComment: async (taskId: string, commentId: string, body: string): Promise<TaskComment> => {
    const { data } = await api.patch<TaskComment>(`/tasks/${taskId}/comments/${commentId}`, { body });
    return data;
  },

  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  getActivity: async (taskId: string): Promise<TaskActivity[]> => {
    const { data } = await api.get<TaskActivity[]>(`/tasks/${taskId}/activity`);
    return data ?? [];
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post("/tasks/bulk", { ids, action: "delete" });
  },

  bulkUpdateStatus: async (ids: string[], status: string): Promise<void> => {
    await api.post("/tasks/bulk", { ids, action: "set_status", payload: { status } });
  },

  startTimer: async (taskId: string): Promise<TimeEntry> => {
    const { data } = await api.post<TimeEntry>(`/tasks/${taskId}/timer/start`);
    return data;
  },

  stopTimer: async (taskId: string): Promise<TimeEntry> => {
    const { data } = await api.post<TimeEntry>(`/tasks/${taskId}/timer/stop`);
    return data;
  },

  getTimerStatus: async (taskId: string): Promise<TimerStatus> => {
    const { data } = await api.get<TimerStatus>(`/tasks/${taskId}/timer`);
    return data;
  },

  getTimeTracking: async (): Promise<TimeTrackingToday> => {
    const { data } = await api.get<TimeTrackingToday>("/tasks/time-tracking/today");
    return data;
  },
};
