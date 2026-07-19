"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe, clearAuthSentinel } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePlanStore } from "@/lib/stores/planStore";

/** Fetches /users/me on app mount and syncs user + plan into stores (cookies hold the session). */
export function AuthBootstrap() {
  const { data, isSuccess, isError } = useMe();
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);
  const setPlan = usePlanStore((s) => s.setPlan);
  const router = useRouter();

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
      setPlan(data.plan ?? "free");
      if (!data.onboardingCompleted) router.replace("/onboarding");
    }
  }, [isSuccess, data, setUser, setPlan, router]);

  useEffect(() => {
    if (isError) {
      clear();
      clearAuthSentinel();
      router.replace("/login");
    }
  }, [isError, clear, router]);

  return null;
}