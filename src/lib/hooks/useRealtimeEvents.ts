"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/authStore";
import { api } from "@/lib/api/client";

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
          const msg = JSON.parse(e.data as string) as { type: string; [k: string]: unknown };
          switch (msg.type) {
            case "task.updated":
            case "task.deleted":
              qc.invalidateQueries({ queryKey: ["tasks"] });
              qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
              break;
            case "habit.checked":
            case "habit.updated":
              qc.invalidateQueries({ queryKey: ["habits"] });
              qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
              break;
            case "journal.updated":
              qc.invalidateQueries({ queryKey: ["journal"] });
              qc.invalidateQueries({ queryKey: ["dashboard", "today"] });
              break;
            case "goal.updated":
              qc.invalidateQueries({ queryKey: ["goals"] });
              break;
            case "xp.earned": {
              const { xpAmount, totalXp, level, leveledUp, source } = msg as unknown as {
                xpAmount: number;
                totalXp: number;
                level: number;
                leveledUp: boolean;
                source: string;
              };
              qc.invalidateQueries({ queryKey: ["xp"] });
              qc.invalidateQueries({ queryKey: ["achievements"] });
              if (leveledUp) {
                toast.success(`🎉 Уровень ${level}! +${xpAmount} XP`, {
                  description: `Всего XP: ${totalXp}`,
                  duration: 5000,
                });
              } else if (xpAmount > 0 && source !== "habit_completed") {
                toast(`+${xpAmount} XP`, { duration: 2000 });
              }
              break;
            }
            case "achievement.unlocked": {
              const { title, icon, xpReward } = msg as unknown as {
                achievementId: string;
                title: string;
                icon: string;
                xpReward: number;
              };
              qc.invalidateQueries({ queryKey: ["achievements"] });
              qc.invalidateQueries({ queryKey: ["xp"] });
              toast.success(`${icon} Достижение разблокировано!`, {
                description: `${title} · +${xpReward} XP`,
                duration: 6000,
              });
              break;
            }
          }
        } catch { /* ignore malformed */ }
      };

      ws.onclose = () => {
        clearInterval(pingInterval);
        if (!destroyed) {
          // The access_token cookie the WS handshake relies on expires after
          // ACCESS_TOKEN_EXPIRE_MINUTES (60min) — unlike regular API calls, a
          // WS connection has no interceptor to silently refresh it, so once
          // it expires the socket closes and every retry gets rejected with
          // 403 forever (confirmed in prod: real users' tabs left open past
          // an hour stop receiving realtime updates entirely until reload).
          // Piggyback on the same axios instance whose 401 interceptor
          // refreshes the token, so the next connect() attempt has a live
          // cookie again.
          api.get("/users/me").catch(() => {});
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
