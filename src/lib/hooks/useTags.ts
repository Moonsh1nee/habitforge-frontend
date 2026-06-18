"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tagsApi } from "@/lib/api/tags";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsApi.getAll(),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; color?: string }) => tagsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
    onError: () => toast.error("Ошибка создания тега"),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => toast.error("Ошибка удаления тега"),
  });
}

export function useAddTagToTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      tagsApi.addToTask(taskId, tagId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useRemoveTagFromTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      tagsApi.removeFromTask(taskId, tagId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
