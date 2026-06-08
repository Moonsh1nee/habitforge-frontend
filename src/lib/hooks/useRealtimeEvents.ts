"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";

export function useRealtimeEvents() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;

    let ws: WebSocket;
    let pingInterval: ReturnType<typeof setInterval>;
    let retryTimeout: ReturnType<typeof setTimeout>;
    let retries = 0;
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
      // Cookies are sent automatically by the browser on WS upgrade (HTTP standard).
      // No token query param needed when using HttpOnly cookies.
      ws = new WebSocket(`${wsUrl}/ws/events`);

      ws.onopen = () => {
        retries = 0;
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        }, 30_000);
      };

      ws.onmessage = (e) => {
        if (e.data === "pong") return;
        try {
          const { type } = JSON.parse(e.data as string) as { type: string };
          switch (type) {
            case "task.updated":
            case "task.deleted":
              qc.invalidateQueries({ queryKey: ["tasks"] });
              qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
              break;
            case "habit.checked":
              qc.invalidateQueries({ queryKey: ["habits"] });
              qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
              break;
            case "journal.updated":
              qc.invalidateQueries({ queryKey: ["journal"] });
              qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
              break;
            case "nutrition.logged":
              qc.invalidateQueries({ queryKey: ["nutrition"] });
              qc.invalidateQueries({ queryKey: ["nutrition-plans"] });
              qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
              break;
            case "finance.updated":
              qc.invalidateQueries({ queryKey: ["finance-categories"] });
              qc.invalidateQueries({ queryKey: ["finance-transactions"] });
              qc.invalidateQueries({ queryKey: ["finance-summary"] });
              qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
              break;
            case "workout.updated":
              qc.invalidateQueries({ queryKey: ["workout-plans"] });
              qc.invalidateQueries({ queryKey: ["workout-logs"] });
              qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
              break;
          }
        } catch { /* ignore malformed */ }
      };

      ws.onclose = () => {
        clearInterval(pingInterval);
        if (!destroyed) {
          const delay = Math.min(1_000 * 2 ** retries, 30_000);
          retries++;
          retryTimeout = setTimeout(connect, delay);
        }
      };
    }

    connect();

    return () => {
      destroyed = true;
      clearInterval(pingInterval);
      clearTimeout(retryTimeout);
      ws?.close();
    };
  }, [user, qc]);
}
