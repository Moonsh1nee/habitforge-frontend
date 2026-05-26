"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";

export function useRealtimeEvents() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
    const ws = new WebSocket(`${wsUrl}/ws/events?token=${accessToken}`);

    let pingInterval: ReturnType<typeof setInterval>;

    ws.onopen = () => {
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 30_000);
    };

    ws.onmessage = (event) => {
      if (event.data === "pong") return;
      try {
        const { event: type } = JSON.parse(event.data as string);
        if (typeof type === "string") {
          if (type.startsWith("task_")) qc.invalidateQueries({ queryKey: ["tasks"] });
          if (type.startsWith("habit_")) qc.invalidateQueries({ queryKey: ["habits"] });
          if (type === "dashboard_updated") qc.invalidateQueries({ queryKey: ["dashboard"] });
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => clearInterval(pingInterval);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [accessToken, qc]);
}
