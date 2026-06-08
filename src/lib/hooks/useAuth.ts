"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { authApi } from "@/lib/api/auth";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";

export function useMe() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    enabled: !user, // only fetch if we don't have user in memory yet
    retry: false,
  });
}

export function useLogin() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setUser(data.user);
      router.push("/dashboard");
    },
    onError: () => toast.error("Неверный email или пароль"),
  });
}

export function useRegister() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: ({
      email,
      password,
      username,
      firstName,
    }: {
      email: string;
      password: string;
      username: string;
      firstName: string;
    }) => authApi.register(email, password, username, firstName),
    onSuccess: (data) => {
      setUser(data.user);
      router.push("/dashboard");
    },
    onError: () => toast.error("Ошибка регистрации. Попробуйте снова."),
  });
}

export function useLogout() {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clear();
      router.push("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post("/auth/forgot-password", { email }),
    onSuccess: () =>
      toast.success("Если email зарегистрирован, письмо отправлено"),
    onError: () =>
      // Намеренно одинаковый ответ — не раскрываем существование аккаунта
      toast.success("Если email зарегистрирован, письмо отправлено"),
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      token,
      new_password,
    }: {
      token: string;
      new_password: string;
    }) => api.post("/auth/reset-password", { token, new_password }),
    onSuccess: () => {
      toast.success("Пароль обновлён");
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 400)
        toast.error("Ссылка истекла или недействительна. Запросите новую.");
      else toast.error("Ошибка сброса пароля");
    },
  });
}
