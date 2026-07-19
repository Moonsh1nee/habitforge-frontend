"use client";

import { useState } from "react";
import { CalendarCheck, Loader2, RefreshCw, Unplug, CalendarPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import {
  useGoogleStatus,
  useGoogleConnect,
  useGoogleSync,
  useGoogleDisconnect,
} from "@/lib/hooks/useGoogleCalendar";

export function GoogleCalendarCard() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: status, isLoading } = useGoogleStatus();
  const connect = useGoogleConnect();
  const sync = useGoogleSync();
  const disconnect = useGoogleDisconnect();

  if (isLoading) {
    return (
      <GlassCard className="p-6 flex items-center gap-3">
        <Loader2 size={18} className="animate-spin text-muted" />
        <span className="text-sm text-muted">Загрузка...</span>
      </GlassCard>
    );
  }

  const lastSync = status?.lastSyncedAt
    ? formatDistanceToNow(new Date(status.lastSyncedAt), { addSuffix: true, locale: ru })
    : null;

  return (
    <>
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarCheck size={20} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text">Google Calendar</h3>
                {status?.connected && (
                  <span className="text-[10px] font-bold bg-success/15 text-success rounded-full px-2 py-0.5 leading-none">
                    Подключён
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                {status?.connected
                  ? `Календарь: ${status.calendarId ?? "primary"}`
                  : "Синхронизируйте задачи с Google Calendar"}
              </p>
            </div>
          </div>
        </div>

        {status?.connected && lastSync && (
          <p className="text-xs text-muted">
            Последняя синхронизация: {lastSync}
          </p>
        )}

        <div className="flex gap-2 flex-wrap">
          {status?.connected ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sync.mutate()}
                disabled={sync.isPending}
                className="gap-2"
              >
                {sync.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Синхронизировать сейчас
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmOpen(true)}
                className="gap-2 text-danger border-danger/30 hover:bg-danger/10"
              >
                <Unplug size={14} />
                Отключить
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => connect.mutate()}
              disabled={connect.isPending}
              className="gap-2 bg-primary text-white hover:opacity-90"
            >
              {connect.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CalendarPlus size={14} />
              )}
              Подключить
            </Button>
          )}
        </div>
      </GlassCard>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => disconnect.mutate()}
        isPending={disconnect.isPending}
        title="Отключить Google Calendar?"
        description="Синхронизация задач с Google Calendar будет остановлена. Уже созданные события не удалятся."
      />
    </>
  );
}
