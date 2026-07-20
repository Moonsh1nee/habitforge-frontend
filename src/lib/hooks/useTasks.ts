"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi, type TaskFilters } from "@/lib/api/tasks";
import type { Task, TaskComment, TaskActivity } from "@/types";

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

export function useTaskActivity(taskId: string) {
  return useQuery<TaskActivity[]>({
    queryKey: ["tasks", taskId, "activity"],
    queryFn: () => tasksApi.getActivity(taskId),
    enabled: !!taskId,
  });
}

export function useBulkDeleteTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => tasksApi.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Задачи удалены");
    },
    onError: () => toast.error("Ошибка удаления задач"),
  });
}

export function useBulkUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      tasksApi.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Статус обновлён");
    },
    onError: () => toast.error("Ошибка обновления статуса"),
  });
}

export function useTaskTimer(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId, "timer"],
    queryFn: () => tasksApi.getTimerStatus(taskId),
    enabled: !!taskId,
    refetchInterval: (query) => (query.state.data?.isRunning ? 10_000 : false),
  });
}

export function useStartTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.startTimer(taskId),
    onSuccess: (_, taskId) => {
      qc.invalidateQueries({ queryKey: ["tasks", taskId, "timer"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => toast.error("Не удалось запустить таймер"),
  });
}

export function useStopTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.stopTimer(taskId),
    onSuccess: (_, taskId) => {
      qc.invalidateQueries({ queryKey: ["tasks", taskId, "timer"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => toast.error("Не удалось остановить таймер"),
  });
}

export function useTimeTrackingToday() {
  return useQuery({
    queryKey: ["time-tracking", "today"],
    queryFn: tasksApi.getTimeTracking,
    staleTime: 60_000,
  });
}
