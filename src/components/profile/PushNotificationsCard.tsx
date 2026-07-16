"use client";

import React, { useState } from "react";
import { Bell, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { pushApi } from "@/lib/api/push";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

export function PushNotificationsCard() {
  const [status, setStatus] = useState<"idle" | "loading" | "subscribed" | "unsupported">("idle");

  React.useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    if (!supported) { setStatus("unsupported"); return; }
    (async () => {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager?.getSubscription();
      setStatus(sub ? "subscribed" : "idle");
    })();
  }, []);

  const subscribe = async () => {
    setStatus("loading");
    try {
      const vapidKey = await pushApi.getVapidKey();
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });
      await pushApi.subscribe(sub.toJSON());
      setStatus("subscribed");
      toast.success("Push-уведомления включены");
    } catch {
      toast.error("Не удалось подключить уведомления");
      setStatus("idle");
    }
  };

  const unsubscribe = async () => {
    setStatus("loading");
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager?.getSubscription();
      if (sub) {
        await pushApi.unsubscribe(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("idle");
      toast.success("Push-уведомления отключены");
    } catch {
      toast.error("Ошибка отключения уведомлений");
      setStatus("subscribed");
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Bell size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text text-sm">Push-уведомления</p>
          <p className="text-xs text-muted">
            {status === "unsupported"
              ? "Браузер не поддерживает уведомления"
              : status === "subscribed"
              ? "Уведомления включены"
              : "Получайте напоминания прямо в браузере"}
          </p>
        </div>
        {status !== "unsupported" && (
          <button
            onClick={status === "subscribed" ? unsubscribe : subscribe}
            disabled={status === "loading"}
            className={cn(
              "shrink-0 transition-colors",
              status === "subscribed" ? "text-primary" : "text-muted hover:text-primary"
            )}
            aria-label={status === "subscribed" ? "Отключить уведомления" : "Включить уведомления"}
          >
            {status === "loading" ? (
              <Loader2 size={22} className="animate-spin" />
            ) : status === "subscribed" ? (
              <ToggleRight size={26} />
            ) : (
              <ToggleLeft size={26} />
            )}
          </button>
        )}
      </div>
    </GlassCard>
  );
}
