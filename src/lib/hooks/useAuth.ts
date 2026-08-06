"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { authApi } from "@/lib/api/auth";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    retry: false,
    staleTime: 30_000,
  });
}

// The backend sets auth tokens as HttpOnly cookies on its own port.
// Browsers don't share HttpOnly cookies across ports on localhost, so we set a
// plain sentinel cookie from the frontend domain that the proxy can read.
function setAuthSentinel() {
  document.cookie = "auth_ok=1; path=/; SameSite=Lax; max-age=86400";
}
export function clearAuthSentinel() {
  document.cookie = "auth_ok=; path=/; max-age=0";
}

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setUser(data.user);
      setAuthSentinel();
      // ?next= is set when the login page was reached via a redirect from
      // GET /oauth/authorize (a third-party app's "Sign in with GetGrip"
      // flow) — it's a fully-qualified backend URL (settings.PUBLIC_API_URL
      // based), so this must be a real navigation, not router.push, since
      // it may point at a different origin than this frontend.
      const next = searchParams.get("next");
      if (next) {
        window.location.href = next;
        return;
      }
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
      setAuthSentinel();
      router.push(data.user.onboardingCompleted ? "/dashboard" : "/onboarding");
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
      clearAuthSentinel();
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
