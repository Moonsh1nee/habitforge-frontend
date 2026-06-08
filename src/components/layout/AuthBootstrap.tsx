"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/stores/authStore";

/** Fetches /users/me on app mount and syncs user into the store (cookies hold the session). */
export function AuthBootstrap() {
  const { data, isSuccess, isError } = useMe();
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();

  useEffect(() => {
    if (isSuccess && data) setUser(data);
  }, [isSuccess, data, setUser]);

  useEffect(() => {
    if (isError) {
      clear();
      router.replace("/login");
    }
  }, [isError, clear, router]);

  return null;
}