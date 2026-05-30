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
          case "nutrition.logged":
            qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
            break;
        }
      } catch { /* ignore malformed */ }
    };

    ws.onclose = () => clearInterval(pingInterval);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [accessToken, qc]);
}
