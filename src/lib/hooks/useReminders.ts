"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { remindersApi, type CreateReminderPayload } from "@/lib/api/reminders";

export function useReminders() {
  return useQuery({
    queryKey: ["reminders"],
    queryFn: remindersApi.getAll,
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReminderPayload) => remindersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Напоминание создано");
    },
    onError: () => toast.error("Не удалось создать напоминание"),
  });
}

export function useUpdateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateReminderPayload> & { isActive?: boolean } }) =>
      remindersApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Напоминание обновлено");
    },
    onError: () => toast.error("Не удалось обновить напоминание"),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Напоминание удалено");
    },
    onError: () => toast.error("Не удалось удалить напоминание"),
  });
}
