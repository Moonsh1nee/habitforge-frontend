"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe, clearAuthSentinel } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePlanStore } from "@/lib/stores/planStore";
import { useDashboardStore } from "@/lib/stores/dashboardStore";
import { useOnboardingStore, type AppModule } from "@/lib/stores/onboardingStore";
import { useSnoozeReminder } from "@/lib/hooks/useTasks";

/** Fetches /users/me on app mount and syncs user + plan into stores (cookies hold the session). */
export function AuthBootstrap() {
  const { data, isSuccess, isError } = useMe();
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);
  const setPlan = usePlanStore((s) => s.setPlan);
  const hydrateDashboard = useDashboardStore((s) => s.hydrate);
  const hydrateModules = useOnboardingStore((s) => s.hydrate);
  const router = useRouter();
  const snoozeReminder = useSnoozeReminder();

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
      setPlan(data.plan ?? "free");
      hydrateDashboard(data.dashboardLayout);
      hydrateModules((data.enabledModules as AppModule[] | null) ?? null);
      if (!data.onboardingCompleted) router.replace("/onboarding");
    }
  }, [isSuccess, data, setUser, setPlan, hydrateDashboard, hydrateModules, router]);

  useEffect(() => {
    if (isError) {
      clear();
      clearAuthSentinel();
      router.replace("/login");
    }
  }, [isError, clear, router]);

  // Snooze action on push notifications is handled by the SW via postMessage —
  // the SW has no access to the API base URL / auth cookies context here.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "snooze-reminder" && event.data.taskId) {
        snoozeReminder.mutate({ taskId: event.data.taskId, minutes: event.data.minutes ?? 15 });
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [snoozeReminder]);

  return null;
}
