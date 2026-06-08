"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { journalApi } from "@/lib/api/journal";
import type { DailyEntry } from "@/types";

export function useJournalEntry(date: string) {
  return useQuery({
    queryKey: ["journal", date],
    queryFn: () => journalApi.getEntry(date).catch(() => null),
    enabled: !!date,
  });
}

export function useJournalEntries(params: { start: string; end: string; limit?: number }) {
  return useQuery({
    queryKey: ["journal", "entries", params.start, params.end, params.limit],
    queryFn: () => journalApi.getEntries(params),
    enabled: !!params.start && !!params.end,
  });
}

export function useSaveJournalEntry(date: string, existing: DailyEntry | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof journalApi.createEntry>[0]) =>
      existing ? journalApi.updateEntry(date, payload) : journalApi.createEntry(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
      toast.success("Запись сохранена");
    },
    onError: () => toast.error("Ошибка сохранения записи"),
  });
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => journalApi.deleteEntry(date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
      toast.success("Запись удалена");
    },
    onError: () => toast.error("Ошибка удаления записи"),
  });
}