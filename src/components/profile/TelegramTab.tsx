"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { telegramApi } from "@/lib/api/telegram";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { PushNotificationsCard } from "./PushNotificationsCard";
import { TelegramReminderForm } from "./TelegramReminderForm";
import type { AxiosError } from "axios";

export function TelegramTab() {
  const qc = useQueryClient();
  const [reminderOpen, setReminderOpen] = useState(false);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [linkCodeOpen, setLinkCodeOpen] = useState(false);

  const { data: link, error: linkError } = useQuery({
    queryKey: ["telegram-link"],
    queryFn: telegramApi.getLink,
    throwOnError: false,
    retry: false,
  });

  const isLinked = link?.isActive === true;
  const hasFetchError = !!linkError && (linkError as AxiosError).response?.status !== 404;

  const { data: reminders } = useQuery({
    queryKey: ["telegram-reminders"],
    queryFn: telegramApi.getReminders,
  });

  const getLinkCode = useMutation({
    mutationFn: telegramApi.getLinkCode,
    onSuccess: ({ code }) => { setLinkCode(code); setLinkCodeOpen(true); },
    onError: () => toast.error("Не удалось получить код привязки"),
  });

  const unlink = useMutation({
    mutationFn: telegramApi.unlink,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["telegram-link"] });
      toast.success("Telegram отвязан");
    },
  });

  const toggleReminder = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      telegramApi.updateReminder(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["telegram-reminders"] }),
  });

  const deleteReminder = useMutation({
    mutationFn: (id: string) => telegramApi.deleteReminder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["telegram-reminders"] });
      toast.success("Напоминание удалено");
    },
  });

  const closeLinkDialog = () => {
    setLinkCodeOpen(false);
    setLinkCode(null);
    qc.invalidateQueries({ queryKey: ["telegram-link"] });
  };

  return (
    <div className="space-y-5">
      <PushNotificationsCard />

      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#229ED9]/20 flex items-center justify-center">
            <MessageSquare size={20} className="text-[#229ED9]" />
          </div>
          <div>
            <h3 className="font-semibold text-text">Telegram-бот</h3>
            <p className="text-xs text-muted">
              {isLinked
                ? `Привязан${link?.username ? ` (@${link.username})` : ""}`
                : hasFetchError
                  ? "Ошибка загрузки"
                  : "Не привязан"}
            </p>
          </div>
          <div className={`ml-auto w-2 h-2 rounded-full ${isLinked ? "bg-success" : "bg-muted"}`} />
        </div>
        {isLinked ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => unlink.mutate()}
            disabled={unlink.isPending}
            className="border-danger/40 text-danger hover:bg-danger/10"
          >
            Отвязать
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => getLinkCode.mutate()}
            disabled={getLinkCode.isPending}
            className="border-[#229ED9]/40 text-[#229ED9] hover:bg-[#229ED9]/10"
          >
            {getLinkCode.isPending ? "Получаем код..." : "Привязать"}
          </Button>
        )}
      </GlassCard>

      <Dialog open={linkCodeOpen && !!linkCode} onOpenChange={(open) => { if (!open) closeLinkDialog(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Привязка Telegram</DialogTitle>
          </DialogHeader>
          {linkCode && (
            <div className="space-y-4">
              <ol className="text-sm text-muted space-y-2 list-decimal list-inside">
                <li>Откройте нашего Telegram-бота</li>
                <li>Отправьте команду <span className="text-text font-mono">/start</span></li>
                <li>Введите код ниже в ответ на запрос бота</li>
              </ol>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-muted mb-1">Ваш код</p>
                <p className="text-3xl font-mono font-bold text-primary tracking-widest">{linkCode}</p>
                <p className="text-xs text-muted mt-2">Действителен 15 минут</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => { navigator.clipboard.writeText(linkCode); toast.success("Код скопирован"); }}
                >
                  Скопировать
                </Button>
                <Button size="sm" className="flex-1 bg-primary text-white" onClick={closeLinkDialog}>
                  Готово
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-text flex items-center gap-2">
            <Bell size={16} className="text-primary" />
            Напоминания
          </h3>
          <Button size="sm" onClick={() => setReminderOpen(true)} className="bg-primary text-white gap-1.5">
            <Plus size={14} />
            Добавить
          </Button>
        </div>

        {!reminders || reminders.length === 0 ? (
          <p className="text-sm text-muted text-center py-6 glass rounded-xl">Нет напоминаний</p>
        ) : (
          <div className="space-y-2">
            {reminders.map((r) => (
              <div key={r.id} className="glass p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{r.title}</p>
                  <p className="text-xs text-muted font-mono mt-0.5">{r.cronExpression}</p>
                  {r.lastSentAt && (
                    <p className="text-xs text-muted mt-1">
                      Отправлено: {formatDate(r.lastSentAt, "d MMM, HH:mm")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleReminder.mutate({ id: r.id, isActive: !r.isActive })}
                    className={r.isActive ? "text-primary" : "text-muted"}
                  >
                    {r.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button
                    onClick={() => deleteReminder.mutate(r.id)}
                    className="text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новое напоминание</DialogTitle>
          </DialogHeader>
          <TelegramReminderForm onSuccess={() => setReminderOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
