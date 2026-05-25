"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    enabled: !!accessToken,
  });
}

export function useLogin() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      router.push("/dashboard");
    },
    onError: () => toast.error("Неверный email или пароль"),
  });
}

export function useRegister() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
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
      setTokens(data.access_token, data.refresh_token);
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
