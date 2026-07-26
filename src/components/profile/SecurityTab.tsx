"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Monitor, Smartphone, Globe } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { usersApi } from "@/lib/api/users";
import { authApi } from "@/lib/api/auth";
import { useSessions, useRevokeSession, useRevokeAllSessions } from "@/lib/hooks/useSessions";
import { parseDeviceInfo } from "@/lib/utils";
import type { Session } from "@/types";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function SessionRow({ session }: { session: Session }) {
  const revoke = useRevokeSession();

  const { label, isMobile } = parseDeviceInfo(session.deviceInfo);
  const icon = isMobile
    ? <Smartphone size={14} className="text-muted" />
    : <Monitor size={14} className="text-muted" />;
  const activeAt = session.lastActiveAt ?? session.createdAt;

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon}
        <div className="min-w-0">
          <p className="text-sm text-text truncate flex items-center gap-1.5">
            {label}
            {session.isCurrent && (
              <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
                Текущая
              </span>
            )}
          </p>
          <p className="text-xs text-muted">
            {session.ipAddress && <span className="mr-2">{session.ipAddress}</span>}
            {format(new Date(activeAt), "d MMM, HH:mm", { locale: ru })}
          </p>
        </div>
      </div>
      {!session.isCurrent && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => revoke.mutate(session.id)}
          disabled={revoke.isPending}
          className="shrink-0 text-xs border-border text-muted hover:text-danger hover:border-danger/40"
        >
          {revoke.isPending ? <Loader2 size={12} className="animate-spin" /> : "Завершить"}
        </Button>
      )}
    </div>
  );
}

export function SecurityTab() {
  const router = useRouter();
  const { clear } = useAuthStore();
  const [deletePassword, setDeletePassword] = useState("");

  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const revokeAll = useRevokeAllSessions();

  const logoutAll = useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: () => {
      clear();
      router.push("/login");
      toast.success("Выполнен выход на всех устройствах");
    },
    onError: () => toast.error("Ошибка выхода"),
  });

  const changePassword = useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      usersApi.changePassword(current, next),
    onSuccess: () => toast.success("Пароль изменён"),
    onError: () => toast.error("Неверный текущий пароль"),
  });

  const deleteAccount = useMutation({
    mutationFn: (password: string) => usersApi.deleteAccount(password),
    onSuccess: () => {
      clear();
      router.push("/login");
      toast.success("Аккаунт удалён");
    },
    onError: () => toast.error("Неверный пароль"),
  });

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = fd.get("new") as string;
    const confirm = fd.get("confirm") as string;
    if (next !== confirm) { toast.error("Пароли не совпадают"); return; }
    changePassword.mutate({ current: fd.get("current") as string, next });
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="space-y-6">
      <GlassCard>
        <h3 className="font-semibold text-text mb-4">Смена пароля</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {[
            { name: "current", label: "Текущий пароль" },
            { name: "new", label: "Новый пароль" },
            { name: "confirm", label: "Подтвердите пароль" },
          ].map(({ name, label }) => (
            <div key={name} className="space-y-2">
              <Label>{label}</Label>
              <Input name={name} type="password" placeholder="••••••••" />
            </div>
          ))}
          <Button type="submit" disabled={changePassword.isPending} className="bg-primary text-white">
            {changePassword.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
            Изменить пароль
          </Button>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-text mb-0.5">Активные сессии</h3>
            <p className="text-xs text-muted">Устройства с активным доступом к аккаунту</p>
          </div>
          {otherSessions.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => revokeAll.mutate()}
              disabled={revokeAll.isPending}
              className="border-border text-muted hover:text-danger hover:border-danger/40 text-xs"
            >
              {revokeAll.isPending ? <Loader2 size={12} className="animate-spin" /> : "Завершить все"}
            </Button>
          )}
        </div>
        {sessionsLoading ? (
          <div className="flex items-center gap-2 text-muted text-sm py-2">
            <Loader2 size={14} className="animate-spin" /> Загрузка...
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex items-center gap-2 text-muted text-sm py-2">
            <Globe size={14} /> Нет активных сессий
          </div>
        ) : (
          <div>
            {sessions.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => logoutAll.mutate()}
            disabled={logoutAll.isPending}
            className="border-border text-text hover:bg-white/5 gap-2"
          >
            {logoutAll.isPending && <Loader2 size={15} className="animate-spin" />}
            Выйти на всех устройствах
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="border-danger/20">
        <h3 className="font-semibold text-danger mb-2">Danger Zone</h3>
        <p className="text-sm text-muted mb-4">Удаление аккаунта необратимо. Все данные будут уничтожены.</p>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" className="bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30">
                Удалить аккаунт
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить аккаунт?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted">
                Это действие нельзя отменить. Все ваши данные (задачи, привычки,
                дневник, тренировки) будут удалены навсегда.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <Label>Введите текущий пароль для подтверждения</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAccount.mutate(deletePassword)}
                disabled={!deletePassword || deleteAccount.isPending}
                className="bg-danger text-white hover:bg-danger/80"
              >
                {deleteAccount.isPending && <Loader2 size={14} className="animate-spin mr-1" />}
                Удалить навсегда
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </GlassCard>
    </div>
  );
}
