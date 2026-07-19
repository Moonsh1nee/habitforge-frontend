"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { integrationsApi } from "@/lib/api/integrations";

export function useGoogleStatus() {
  return useQuery({
    queryKey: ["google-calendar-status"],
    queryFn: integrationsApi.googleStatus,
    staleTime: 30_000,
  });
}

export function useGoogleConnect() {
  return useMutation({
    mutationFn: integrationsApi.googleAuth,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error("Не удалось получить ссылку авторизации"),
  });
}

export function useGoogleSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: integrationsApi.googleSync,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["google-calendar-status"] });
      toast.success("Синхронизация выполнена");
    },
    onError: () => toast.error("Ошибка синхронизации"),
  });
}

export function useGoogleDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: integrationsApi.googleDisconnect,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["google-calendar-status"] });
      toast.success("Google Calendar отключён");
    },
    onError: () => toast.error("Ошибка отключения"),
  });
}
