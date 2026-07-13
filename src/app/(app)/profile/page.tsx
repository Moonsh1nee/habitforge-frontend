"use client";

import React, { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Lock,
  MessageSquare,
  Database,
  LayoutGrid,
  Loader2,
  Upload,
  Plus,
  Trash2,
  Bell,
  ToggleLeft,
  ToggleRight,
  Download,
  CreditCard,
  Sparkles,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMe } from "@/lib/hooks/useAuth";
import { usersApi } from "@/lib/api/users";
import { authApi } from "@/lib/api/auth";
import { mediaUrl } from "@/lib/api/client";
import { telegramApi, type Reminder } from "@/lib/api/telegram";
import { pushApi } from "@/lib/api/push";
import { GlassCard } from "@/components/shared/GlassCard";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDate } from "@/lib/utils";
import { usePlan } from "@/lib/hooks/usePlan";
import { useOnboardingStore, MODULES as MODULE_LIST, type AppModule } from "@/lib/stores/onboardingStore";
import type { User as UserType } from "@/types";
import type { AxiosError } from "axios";

// ─── Profile Tab ────────────────────────────────────────────────────────────

function ProfileTab({ user }: { user: UserType }) {
  const qc = useQueryClient();
  const { setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const update = useMutation({
    mutationFn: (payload: { firstName?: string; lastName?: string; bio?: string; timezone?: string }) =>
      usersApi.updateMe(payload),
    onSuccess: (data) => {
      setUser(data);
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Профиль обновлён");
    },
    onError: () => toast.error("Ошибка обновления профиля"),
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (res) => {
      setUser({ ...user, avatarUrl: res.avatarUrl });
      qc.invalidateQueries({ queryKey: ["me"] });
      setPreview(null);
      toast.success("Аватар обновлён");
    },
    onError: () => toast.error("Ошибка загрузки аватара"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    uploadAvatar.mutate(file);
  };

  const avatarSrc = preview ?? mediaUrl(user.avatarUrl);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    update.mutate({
      firstName: fd.get("firstName") as string,
      lastName: fd.get("lastName") as string,
      bio: fd.get("bio") as string,
      timezone: fd.get("timezone") as string,
    });
  };

  return (
    <GlassCard>
      {/* Avatar */}
      <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative group shrink-0"
          title="Изменить аватар"
        >
          <div className="w-20 h-20 rounded-2xl overflow-hidden gradient-primary flex items-center justify-center">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-3xl font-bold">
                {user.firstName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploadAvatar.isPending ? (
              <Loader2 size={18} className="text-white animate-spin" />
            ) : (
              <Upload size={18} className="text-white" />
            )}
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div>
          <p className="font-semibold text-text">{user.firstName}</p>
          <p className="text-sm text-muted">@{user.username}</p>
          <p className="text-xs text-muted mt-1">
            Нажмите на аватар для замены
          </p>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Имя</Label>
            <Input
              name="firstName"
              defaultValue={user.firstName}
            />
          </div>
          <div className="space-y-2">
            <Label>Фамилия</Label>
            <Input
              name="lastName"
              defaultValue={user.lastName ?? ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Юзернейм</Label>
          <Input
            value={user.username ?? ""}
            disabled
            className="opacity-60 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            value={user.email ?? ""}
            disabled
            className="opacity-60 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <Label>О себе</Label>
          <Textarea
            name="bio"
            defaultValue={user.bio ?? ""}
            placeholder="Расскажите о себе..."
            className="resize-none"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Часовой пояс</Label>
          <Input
            name="timezone"
            defaultValue={user.timezone ?? "Europe/Moscow"}
            placeholder="Europe/Moscow"
          />
          <p className="text-xs text-muted">IANA timezone: Europe/Moscow, UTC, America/New_York</p>
        </div>

        <Button
          type="submit"
          disabled={update.isPending}
          className="gradient-primary text-white"
        >
          {update.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
          Сохранить
        </Button>
      </form>
    </GlassCard>
  );
}

// ─── Security Tab ────────────────────────────────────────────────────────────

function SecurityTab() {
  const router = useRouter();
  const { clear } = useAuthStore();
  const [deletePassword, setDeletePassword] = useState("");

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
    mutationFn: ({
      current,
      next,
    }: {
      current: string;
      next: string;
    }) => usersApi.changePassword(current, next),
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
    if (next !== confirm) {
      toast.error("Пароли не совпадают");
      return;
    }
    changePassword.mutate({ current: fd.get("current") as string, next });
  };

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
              <Input
                name={name}
                type="password"
                placeholder="••••••••"
              />
            </div>
          ))}
          <Button
            type="submit"
            disabled={changePassword.isPending}
            className="gradient-primary text-white"
          >
            {changePassword.isPending && (
              <Loader2 size={16} className="animate-spin mr-2" />
            )}
            Изменить пароль
          </Button>
        </form>
      </GlassCard>

      {/* Logout all devices */}
      <GlassCard>
        <h3 className="font-semibold text-text mb-2">Активные сессии</h3>
        <p className="text-sm text-muted mb-4">
          Выйти из аккаунта на всех устройствах, включая текущее.
        </p>
        <Button
          variant="outline"
          onClick={() => logoutAll.mutate()}
          disabled={logoutAll.isPending}
          className="border-border text-text hover:bg-white/5 gap-2"
        >
          {logoutAll.isPending && <Loader2 size={15} className="animate-spin" />}
          Выйти на всех устройствах
        </Button>
      </GlassCard>

      {/* Danger Zone */}
      <GlassCard className="border-danger/20">
        <h3 className="font-semibold text-danger mb-2">Danger Zone</h3>
        <p className="text-sm text-muted mb-4">
          Удаление аккаунта необратимо. Все данные будут уничтожены.
        </p>
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
              <AlertDialogTitle>
                Удалить аккаунт?
              </AlertDialogTitle>
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
              <AlertDialogCancel>
                Отмена
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteAccount.mutate(deletePassword)}
                disabled={!deletePassword || deleteAccount.isPending}
                className="bg-danger text-white hover:bg-danger/80"
              >
                {deleteAccount.isPending ? (
                  <Loader2 size={14} className="animate-spin mr-1" />
                ) : null}
                Удалить навсегда
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </GlassCard>
    </div>
  );
}

// ─── Push Notifications Card ─────────────────────────────────────────────────

function PushNotificationsCard() {
  const [status, setStatus] = useState<"idle" | "loading" | "subscribed" | "unsupported">("idle");

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const checkStatus = async () => {
    if (!isSupported) { setStatus("unsupported"); return; }
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    const sub = await reg?.pushManager?.getSubscription();
    setStatus(sub ? "subscribed" : "idle");
  };

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

// ─── Telegram Tab ────────────────────────────────────────────────────────────

function ReminderForm({ onSuccess }: { onSuccess: () => void }) {
  const qc = useQueryClient();
  const [type, setType] = useState("custom");
  const create = useMutation({
    mutationFn: (p: Partial<Reminder>) => telegramApi.createReminder(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["telegram-reminders"] });
      toast.success("Напоминание создано");
      onSuccess();
    },
    onError: () => toast.error("Ошибка создания напоминания"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    create.mutate({
      title: fd.get("title") as string,
      type,
      message: fd.get("message") as string,
      cronExpression: fd.get("cron") as string,
      isActive: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input name="title" placeholder="Утренняя медитация" />
      </div>
      <div className="space-y-2">
        <Label>Тип</Label>
        <Select value={type} onValueChange={(v) => setType(v ?? "custom")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="habit">Привычка</SelectItem>
            <SelectItem value="task">Задача</SelectItem>
            <SelectItem value="custom">Произвольное</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Сообщение</Label>
        <Textarea name="message" placeholder="Текст напоминания..." className="resize-none" rows={2} />
      </div>
      <div className="space-y-2">
        <Label>
          Cron-расписание
          <span className="text-muted text-xs ml-2">например: 0 9 * * 1-5</span>
        </Label>
        <Input name="cron" placeholder="0 9 * * *" className="font-mono text-sm" />
      </div>
      <Button type="submit" disabled={create.isPending} className="w-full gradient-primary text-white">
        {create.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
        Создать напоминание
      </Button>
    </form>
  );
}

function TelegramTab() {
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

  // 404 means not linked — expected state, not an error
  const isLinked = link?.isActive === true;
  const hasFetchError =
    !!linkError && (linkError as AxiosError).response?.status !== 404;

  const { data: reminders } = useQuery({
    queryKey: ["telegram-reminders"],
    queryFn: telegramApi.getReminders,
  });

  const getLinkCode = useMutation({
    mutationFn: telegramApi.getLinkCode,
    onSuccess: ({ code }) => {
      setLinkCode(code);
      setLinkCodeOpen(true);
    },
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

  return (
    <div className="space-y-5">
      <PushNotificationsCard />

      {/* Link status */}
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

      {/* Link code dialog */}
      <Dialog
        open={linkCodeOpen && !!linkCode}
        onOpenChange={(open) => {
          if (!open) {
            setLinkCodeOpen(false);
            setLinkCode(null);
            qc.invalidateQueries({ queryKey: ["telegram-link"] });
          }
        }}
      >
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
                  onClick={() => {
                    navigator.clipboard.writeText(linkCode);
                    toast.success("Код скопирован");
                  }}
                >
                  Скопировать
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gradient-primary text-white"
                  onClick={() => {
                    setLinkCodeOpen(false);
                    setLinkCode(null);
                    qc.invalidateQueries({ queryKey: ["telegram-link"] });
                  }}
                >
                  Готово
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reminders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-text flex items-center gap-2">
            <Bell size={16} className="text-primary" />
            Напоминания
          </h3>
          <Button
            size="sm"
            onClick={() => setReminderOpen(true)}
            className="gradient-primary text-white gap-1.5"
          >
            <Plus size={14} />
            Добавить
          </Button>
        </div>

        {!reminders || reminders.length === 0 ? (
          <p className="text-sm text-muted text-center py-6 glass rounded-xl">
            Нет напоминаний
          </p>
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
          <ReminderForm onSuccess={() => setReminderOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Data Tab ────────────────────────────────────────────────────────────────

function DataTab({ user }: { user: UserType }) {
  const { setUser } = useAuthStore();
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);

  const updateTimezone = useMutation({
    mutationFn: (timezone: string) => usersApi.updateMe({ timezone }),
    onSuccess: (data) => {
      setUser(data);
      toast.success("Часовой пояс обновлён");
    },
  });

  const handleExport = async (format: "json" | "csv") => {
    setExporting(format);
    try {
      const blob = await usersApi.exportData(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `habitforge-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Ошибка экспорта данных");
    } finally {
      setExporting(null);
    }
  };

  const handleTimezoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateTimezone.mutate(fd.get("timezone") as string);
  };

  return (
    <div className="space-y-5">
      <GlassCard>
        <h3 className="font-semibold text-text mb-4">Часовой пояс</h3>
        <form onSubmit={handleTimezoneSubmit} className="flex gap-3">
          <Input
            name="timezone"
            defaultValue={user.timezone ?? "Europe/Moscow"}
            placeholder="Europe/Moscow"
            className="flex-1"
          />
          <Button type="submit" disabled={updateTimezone.isPending} className="gradient-primary text-white">
            Сохранить
          </Button>
        </form>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold text-text mb-2">Экспорт данных</h3>
        <p className="text-sm text-muted mb-5">
          Скачайте все свои данные в удобном формате.
        </p>
        <div className="flex gap-3">
          {(["json", "csv"] as const).map((fmt) => (
            <Button
              key={fmt}
              variant="outline"
              onClick={() => handleExport(fmt)}
              disabled={exporting !== null}
              className="border-border text-text hover:bg-white/5 gap-2"
            >
              {exporting === fmt ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              Экспорт {fmt.toUpperCase()}
            </Button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Subscription Tab ────────────────────────────────────────────────────────

function SubscriptionTab() {
  const { plan, isPro } = usePlan();
  const router = useRouter();

  const PRO_FEATURES = [
    "Неограниченные привычки, проекты, теги",
    "Аналитика за 90 дней",
    "Годовой хитмап привычек",
    "Библиотека шаблонов программ",
    "Приоритетная поддержка",
  ];

  return (
    <div className="space-y-5">
      {/* Current plan badge */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            isPro ? "gradient-primary" : "bg-white/8"
          )}>
            {isPro ? (
              <Sparkles size={18} className="text-white" />
            ) : (
              <CreditCard size={18} className="text-muted" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-text">
              {isPro ? "HabitForge Pro" : "Бесплатный план"}
            </h3>
            <p className="text-xs text-muted">
              {isPro ? "Все функции разблокированы" : "Ограниченные возможности"}
            </p>
          </div>
          <span className={cn(
            "ml-auto text-xs font-semibold px-2.5 py-1 rounded-full",
            isPro
              ? "bg-primary/15 text-primary"
              : "bg-white/8 text-muted"
          )}>
            {isPro ? "Pro" : "Free"}
          </span>
        </div>

        {!isPro && (
          <>
            <p className="text-sm text-muted mb-4">
              Перейдите на Pro чтобы разблокировать все возможности HabitForge.
            </p>
            <Button
              className="gradient-primary text-white gap-2"
              onClick={() => router.push("/upgrade")}
            >
              <Sparkles size={15} />
              Перейти на Pro — 499₽/мес
            </Button>
          </>
        )}

        {isPro && (
          <div className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-text">
                <Check size={14} className="text-success shrink-0" />
                {f}
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Manage subscription */}
      {isPro && (
        <GlassCard>
          <h3 className="font-semibold text-text mb-2">Управление подпиской</h3>
          <p className="text-sm text-muted mb-4">
            Изменить план, обновить способ оплаты или отменить подписку через портал Stripe.
          </p>
          <Button
            variant="outline"
            className="border-border text-text hover:bg-white/5 gap-2"
            onClick={() => {
              window.open("https://billing.stripe.com", "_blank");
            }}
          >
            <CreditCard size={15} />
            Открыть портал управления
          </Button>
        </GlassCard>
      )}

      {/* Payment history placeholder */}
      <GlassCard>
        <h3 className="font-semibold text-text mb-3">История платежей</h3>
        {isPro ? (
          <p className="text-sm text-muted text-center py-4">
            История платежей доступна в портале Stripe
          </p>
        ) : (
          <p className="text-sm text-muted text-center py-4">
            Нет платежей
          </p>
        )}
      </GlassCard>

    </div>
  );
}

// ─── Modules Tab ─────────────────────────────────────────────────────────────

function ModulesTab() {
  const { modules, setModules } = useOnboardingStore();
  const active = new Set(modules);

  const toggle = (id: AppModule) => {
    if (active.has(id)) {
      if (active.size === 1) return;
      active.delete(id);
    } else {
      active.add(id);
    }
    setModules([...active] as AppModule[]);
    toast.success("Разделы обновлены");
  };

  return (
    <div className="space-y-5">
      <GlassCard className="p-5">
        <h3 className="font-semibold text-text mb-1">Видимые разделы</h3>
        <p className="text-sm text-muted mb-5">Скрытые разделы не удаляются — данные сохраняются.</p>
        <div className="grid grid-cols-2 gap-3">
          {MODULE_LIST.map(({ id, label, desc, icon: Icon, color }) => {
            const on = active.has(id);
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={cn(
                  "relative p-4 rounded-2xl border text-left transition-all duration-200",
                  on
                    ? "border-primary/40 bg-primary/8"
                    : "border-border bg-white/3 hover:bg-white/6 hover:border-white/15 opacity-50"
                )}
              >
                {on && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check size={9} className="text-white" />
                  </div>
                )}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                  style={{ background: `${color}18` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <p className="text-sm font-semibold text-text leading-tight">{label}</p>
                <p className="text-[11px] text-muted mt-0.5 leading-snug">{desc}</p>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-4">Выбрано: {active.size} из {MODULE_LIST.length}</p>
      </GlassCard>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type SettingsTab = "profile" | "security" | "telegram" | "modules" | "data" | "subscription";

const NAV_ITEMS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profile",      label: "Профиль",      icon: User },
  { id: "security",     label: "Безопасность", icon: Lock },
  { id: "modules",      label: "Разделы",      icon: LayoutGrid },
  { id: "telegram",     label: "Telegram",     icon: MessageSquare },
  { id: "data",         label: "Данные",       icon: Database },
  { id: "subscription", label: "Подписка",     icon: CreditCard },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { isPending, isFetching } = useMe();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  if (!user && (isPending || isFetching)) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-7 w-40 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="flex gap-6 items-start">
          <div className="w-44 shrink-0 space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="flex-1">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user.firstName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">{user.firstName}</h1>
          <p className="text-sm text-muted">@{user.username}</p>
        </div>
      </div>

      {/* Settings layout: fixed left nav + content */}
      <div className="flex gap-6 items-start">
        {/* Left nav — fixed width, never shifts */}
        <nav className="w-44 shrink-0 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                activeTab === id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted hover:text-text hover:bg-white/5"
              )}
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content — fills remaining space */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile"      && <ProfileTab user={user} />}
          {activeTab === "security"     && <SecurityTab />}
          {activeTab === "modules"      && <ModulesTab />}
          {activeTab === "telegram"     && <TelegramTab />}
          {activeTab === "data"         && <DataTab user={user} />}
          {activeTab === "subscription" && <SubscriptionTab />}
        </div>
      </div>
    </div>
  );
}