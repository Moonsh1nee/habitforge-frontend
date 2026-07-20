"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sessionsApi } from "@/lib/api/sessions";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: sessionsApi.getAll,
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionsApi.revoke(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Сессия завершена");
    },
    onError: () => toast.error("Не удалось завершить сессию"),
  });
}

export function useRevokeAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.revokeAll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Все другие сессии завершены");
    },
    onError: () => toast.error("Не удалось завершить сессии"),
  });
}
