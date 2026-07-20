"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi, type TaskFilters } from "@/lib/api/tasks";
import type { Task, TaskComment } from "@/types";

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => tasksApi.getAll(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: () => tasksApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Task>) => tasksApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Задача создана");
    },
    onError: () => toast.error("Ошибка создания задачи"),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Task> }) =>
      tasksApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Ошибка обновления задачи"),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Задача удалена");
    },
    onError: () => toast.error("Ошибка удаления задачи"),
  });
}

export function useSubtasks(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId, "subtasks"],
    queryFn: () => tasksApi.getSubtasks(taskId),
    enabled: !!taskId,
  });
}

export function useCreateSubtask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, title, priority }: { taskId: string; title: string; priority?: number }) =>
      tasksApi.createSubtask(taskId, { title, priority }),
    onSuccess: (_, { taskId }) => {
      qc.invalidateQueries({ queryKey: ["tasks", taskId, "subtasks"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => toast.error("Ошибка создания подзадачи"),
  });
}

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId, "comments"],
    queryFn: () => tasksApi.getComments(taskId),
    enabled: !!taskId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: string }) =>
      tasksApi.createComment(taskId, body),
    onSuccess: (_, { taskId }) => {
      qc.invalidateQueries({ queryKey: ["tasks", taskId, "comments"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => toast.error("Ошибка добавления комментария"),
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, commentId, body }: { taskId: string; commentId: string; body: string }) =>
      tasksApi.updateComment(taskId, commentId, body),
    onSuccess: (comment) => {
      qc.invalidateQueries({ queryKey: ["tasks", comment.taskId, "comments"] });
    },
    onError: () => toast.error("Ошибка редактирования комментария"),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
      tasksApi.deleteComment(taskId, commentId),
    onSuccess: (_, { taskId }) => {
      qc.invalidateQueries({ queryKey: ["tasks", taskId, "comments"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => toast.error("Ошибка удаления комментария"),
  });
}
